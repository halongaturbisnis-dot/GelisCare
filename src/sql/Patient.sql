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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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
