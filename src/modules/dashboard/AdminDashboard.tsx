import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, Skeleton, Button, Input } from '@/components/UI';
import { Users, MessageSquare, Activity, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalPatients: 0, totalMessages: 0, activeToday: 0 });
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [patientsRes, messagesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'patient'),
      supabase.from('messages').select('*', { count: 'exact' })
    ]);

    setPatients(patientsRes.data || []);
    setStats({
      totalPatients: patientsRes.data?.length || 0,
      totalMessages: messagesRes.count || 0,
      activeToday: Math.floor((patientsRes.data?.length || 0) * 0.3) // Mock active
    });
    setIsLoading(false);
  };

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.nik?.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Analisa</h1>
        <div className="text-sm text-slate-500">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          label="Total Pasien" 
          value={stats.totalPatients} 
          loading={isLoading}
        />
        <StatCard 
          icon={<MessageSquare className="text-green-500" />} 
          label="Total Pesan" 
          value={stats.totalMessages} 
          loading={isLoading}
        />
        <StatCard 
          icon={<Activity className="text-orange-500" />} 
          label="Aktif Hari Ini" 
          value={stats.activeToday} 
          loading={isLoading}
        />
      </div>

      {/* Patient List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-black/5 flex flex-wrap gap-4 items-center justify-between">
          <h2 className="font-bold">Database Pasien</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Cari Nama atau NIK..." 
                className="pl-9 w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={16} /> Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">NIK</th>
                <th className="px-6 py-3">Nama Lengkap</th>
                <th className="px-6 py-3">No. Telepon</th>
                <th className="px-6 py-3">Tgl Daftar</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                  </tr>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono">{p.nik}</td>
                    <td className="px-6 py-4 font-medium">{p.full_name}</td>
                    <td className="px-6 py-4">{p.phone}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(p.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/chat/${p.id}`}>
                        <Button variant="ghost" className="text-xs py-1 px-2">Chat</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Tidak ada data pasien</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value, loading }: any) => (
  <Card className="flex items-center gap-4 p-6">
    <div className="w-12 h-12 rounded-md bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold text-slate-800">{value}</p>}
    </div>
  </Card>
);
