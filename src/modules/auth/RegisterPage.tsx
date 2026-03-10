import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/UI';
import { showGlobalLoader, hideGlobalLoader } from '@/utils/ui';
import Swal from 'sweetalert2';

export const RegisterPage = () => {
  const [form, setForm] = useState({
    nik: '',
    fullName: '',
    email: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showGlobalLoader();

    try {
      // Custom Registration Logic: Insert directly into profiles table
      // This bypasses Supabase Auth and its rate limits
      const { error: profileError } = await supabase.from('profiles').insert({
        nik: form.nik,
        email: form.email,
        password: form.password, // Plain text for demo simplicity
        full_name: form.fullName,
        phone: form.phone,
        province: form.province,
        city: form.city,
        district: form.district,
        role: 'patient',
      });

      if (profileError) {
        if (profileError.message.includes('duplicate key')) {
          throw new Error('NIK sudah terdaftar.');
        }
        throw profileError;
      }

      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah terdaftar. Silakan masuk.',
        confirmButtonColor: '#006E62',
      });
      navigate('/login');
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: error.message,
        confirmButtonColor: '#006E62',
      });
    } finally {
      setIsLoading(false);
      hideGlobalLoader();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Registrasi Pasien Baru</h1>
          <p className="text-slate-500 text-sm">Lengkapi data diri sesuai KTP untuk pendaftaran</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">NIK (Nomor Induk Kependudukan)</label>
              <Input 
                required 
                placeholder="16 digit NIK sesuai KTP" 
                value={form.nik}
                onChange={e => setForm({ ...form, nik: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Nama Lengkap</label>
              <Input 
                required 
                placeholder="Nama sesuai KTP" 
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Email</label>
              <Input 
                required 
                type="email" 
                placeholder="email@contoh.com" 
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">No. Telepon / WhatsApp</label>
              <Input 
                required 
                placeholder="081234567890" 
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Provinsi</label>
              <Input 
                required 
                placeholder="Contoh: Jawa Barat" 
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Kota / Kabupaten</label>
              <Input 
                required 
                placeholder="Contoh: Bandung" 
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Kecamatan</label>
              <Input 
                required 
                placeholder="Contoh: Coblong" 
                value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Password</label>
              <Input 
                required 
                type="password" 
                placeholder="Minimal 6 karakter" 
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-3 mt-4" isLoading={isLoading}>
            Daftar Sebagai Pasien
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Sudah terdaftar? <Link to="/login" className="text-primary font-bold">Masuk di sini</Link>
        </p>
      </Card>
    </div>
  );
};
