-- Masukkan data Admin ke tabel profiles
-- Password disimpan dalam bentuk teks biasa (plain text) untuk kemudahan demo
-- Jika ingin lebih aman di masa depan, bisa menggunakan hashing.

INSERT INTO public.profiles (
  nik, 
  full_name, 
  email, 
  phone, 
  role, 
  password,
  province,
  city,
  district
) VALUES (
  'Admin', 
  'Administrator GelisCare', 
  'admin@geliscare.com', 
  '08123456789', 
  'admin', 
  'GedeListiana',
  'Bali',
  'Denpasar',
  'Denpasar Selatan'
) ON CONFLICT (nik) DO UPDATE SET 
  password = EXCLUDED.password,
  role = 'admin';
