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
      // Custom Auth Logic: Query profiles table directly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('nik', nik)
        .eq('password', password)
        .single();

      if (profileError || !profile) {
        throw new Error('NIK atau Password salah.');
      }

      // Store session in localStorage for demo simplicity
      localStorage.setItem('geliscare_user', JSON.stringify(profile));
      
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
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
          <p className="text-slate-500 text-sm">Gunakan NIK atau Username Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">NIK / Username</label>
            <Input 
              required 
              placeholder="16 digit NIK atau 'Admin'" 
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
