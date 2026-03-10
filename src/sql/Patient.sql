-- Tabel Profil untuk menyimpan role dan NIK
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nik TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  province TEXT,
  city TEXT,
  district TEXT,
  role TEXT CHECK (role IN ('admin', 'patient')) DEFAULT 'patient',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: To enable auto-delete after 7 days, run this in Supabase SQL Editor:
-- SELECT cron.schedule('delete-old-messages', '0 0 * * *', $$ DELETE FROM public.messages WHERE created_at < NOW() - INTERVAL '7 days' $$);
-- Or use a Database Webhook / Edge Function if pg_cron is not available.

-- Tabel Pesan Chat
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users ON DELETE CASCADE, -- NULL jika broadcast atau ke admin group
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT, -- 'image', 'file'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Broadcast
CREATE TABLE broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  target_filter JSONB, -- Kriteria filter pasien
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for messages
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policies for broadcasts
CREATE POLICY "Everyone can view broadcasts" ON broadcasts FOR SELECT USING (true);
CREATE POLICY "Only admins can create broadcasts" ON broadcasts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tabel Layanan Klinik
CREATE TABLE clinic_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- Nama icon lucide
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Promo
CREATE TABLE promos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for new tables
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view services" ON clinic_services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON clinic_services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view promos" ON promos FOR SELECT USING (true);
CREATE POLICY "Admins can manage promos" ON promos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Dummy Data Layanan
INSERT INTO clinic_services (title, description, icon_name) VALUES
('Poli Umum', 'Pemeriksaan kesehatan rutin dan pengobatan penyakit umum.', 'Stethoscope'),
('Kesehatan Ibu & Anak', 'Layanan imunisasi dan pemeriksaan kehamilan.', 'Heart'),
('Laboratorium & Farmasi', 'Cek darah lengkap dan apotek berkualitas.', 'Pill');

-- Dummy Data Promo
INSERT INTO promos (title, description, image_url) VALUES
('Promo Merdeka: Cek Kolesterol', 'Diskon 50% untuk pemeriksaan kolesterol lengkap selama bulan Agustus.', 'https://images.unsplash.com/photo-1579154273821-ad991fb9a566?auto=format&fit=crop&w=800&q=80'),
('Vaksinasi Anak Gratis', 'Program pemerintah untuk vaksinasi dasar anak di GelisCare Clinic.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80');
