import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/UI';
import { showGlobalLoader, hideGlobalLoader } from '@/utils/ui';
import Swal from 'sweetalert2';

export const LoginPage = () => {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showGlobalLoader();

    try {
      // 1. Find email associated with NIK
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('nik', nik)
        .single();

      if (profileError || !profileData) {
        throw new Error('NIK tidak terdaftar.');
      }

      // Since Supabase Auth needs email, we need to get the email from auth.users
      // However, client-side we can't easily query auth.users by ID.
      // Workaround: In registration, we could have stored the email in profiles too, 
      // or we can use a specific format if we want to be strict.
      // Let's assume we need to fetch the email from the profile if we had stored it.
      // For this implementation, I'll add 'email' to the profiles table to make NIK login easier.
      
      // Re-fetching with email (I will update the schema in the next step)
      const { data: fullProfile, error: emailError } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('nik', nik)
        .single();

      if (emailError || !fullProfile?.email) {
        throw new Error('Data login tidak valid.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: fullProfile.email,
        password,
      });

      if (error) throw error;

      if (fullProfile.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/chat');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.message || 'NIK atau password salah.',
        confirmButtonColor: '#006E62',
      });
    } finally {
      setIsLoading(false);
      hideGlobalLoader();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Masuk GelisCare</h1>
          <p className="text-slate-500 text-sm">Gunakan NIK dan Password Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">NIK (KTP)</label>
            <Input 
              required 
              placeholder="16 digit NIK" 
              value={nik}
              onChange={e => setNik(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Password</label>
            <Input 
              required 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full py-3 mt-4" isLoading={isLoading}>
            Masuk
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Belum punya akun? <Link to="/register" className="text-primary font-bold">Daftar di sini</Link>
        </p>
      </Card>
    </div>
  );
};
