-- Tabel Profil untuk menyimpan role dan NIK
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nik TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL, -- Plain text for demo simplicity
  full_name TEXT,
  phone TEXT,
  province TEXT,
  city TEXT,
  district TEXT,
  role TEXT CHECK (role IN ('admin', 'patient')) DEFAULT 'patient',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Pesan Chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL jika broadcast atau ke admin group
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT, -- 'image', 'file'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Broadcast
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  target_filter JSONB, -- Kriteria filter pasien
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Disable RLS for demo simplicity as requested
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE promos DISABLE ROW LEVEL SECURITY;

-- Dummy Data Layanan
INSERT INTO clinic_services (title, description, icon_name) VALUES
('Poli Umum', 'Pemeriksaan kesehatan rutin dan pengobatan penyakit umum.', 'Stethoscope'),
('Kesehatan Ibu & Anak', 'Layanan imunisasi dan pemeriksaan kehamilan.', 'Heart'),
('Laboratorium & Farmasi', 'Cek darah lengkap dan apotek berkualitas.', 'Pill');

-- Dummy Data Promo
INSERT INTO promos (title, description, image_url) VALUES
('Promo Merdeka: Cek Kolesterol', 'Diskon 50% untuk pemeriksaan kolesterol lengkap selama bulan Agustus.', 'https://images.unsplash.com/photo-1579154273821-ad991fb9a566?auto=format&fit=crop&w=800&q=80'),
('Vaksinasi Anak Gratis', 'Program pemerintah untuk vaksinasi dasar anak di GelisCare Clinic.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80');
