import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Skeleton } from '@/components/UI';
import { MessageSquare, User, MapPin, Calendar, ArrowRight, Bell, Heart, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const PatientDashboard = () => {
  const { profile } = useAuth();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    setBroadcasts(data || []);
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Halo, {profile?.full_name}!</h1>
          <p className="text-slate-500">Selamat datang kembali di Portal Pasien GelisCare Clinic.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-black/5 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                {profile?.full_name?.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-lg">{profile?.full_name}</h2>
                <p className="text-xs text-slate-500 font-mono">NIK: {profile?.nik}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <ProfileItem icon={<User size={16} />} label="Email" value={profile?.email} />
              <ProfileItem icon={<MapPin size={16} />} label="Domisili" value={`${profile?.district}, ${profile?.city}`} />
              <ProfileItem icon={<ShieldCheck size={16} />} label="Status Akun" value="Terverifikasi" />
            </div>

            <Button variant="outline" className="w-full mt-8 text-xs">Edit Profil</Button>
          </Card>

          <Card className="p-6 bg-primary text-white border-none">
            <Heart className="mb-4 opacity-50" size={32} />
            <h3 className="font-bold text-xl mb-2">Butuh Konsultasi?</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Tim medis kami siap membantu Anda melalui layanan chat konsultasi online.
            </p>
            <Link to="/patient/chat">
              <Button className="w-full bg-white text-primary hover:bg-slate-100 border-none">
                Mulai Chat Sekarang
              </Button>
            </Link>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard 
              icon={<MessageSquare className="text-blue-500" />}
              title="Riwayat Konsultasi"
              description="Lihat kembali percakapan Anda dengan dokter."
              to="/patient/chat"
            />
            <ActionCard 
              icon={<Bell className="text-orange-500" />}
              title="Informasi Terbaru"
              description="Cek pengumuman dan promo klinik terbaru."
              to="#pengumuman"
            />
          </div>

          {/* Broadcasts/Announcements */}
          <div id="pengumuman">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Pengumuman Klinik</h2>
              <Link to="#" className="text-primary text-sm font-bold hover:underline">Lihat Semua</Link>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              ) : broadcasts.length > 0 ? (
                broadcasts.map((b) => (
                  <Card key={b.id} className="p-5 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Bell size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {format(new Date(b.created_at), 'd MMM yyyy', { locale: id })}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{b.content}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-md border border-dashed border-slate-300 text-slate-400">
                  Belum ada pengumuman terbaru.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-slate-400">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-700">{value || '-'}</p>
    </div>
  </div>
);

const ActionCard = ({ icon, title, description, to }: { icon: React.ReactNode, title: string, description: string, to: string }) => (
  <Link to={to}>
    <Card className="p-6 hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-primary">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </Card>
  </Link>
);
