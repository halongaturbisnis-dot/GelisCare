import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button, Skeleton } from '@/components/UI';
import { Heart, Stethoscope, Pill, Clock, MapPin, Phone, Star, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';

const iconMap: Record<string, any> = {
  Stethoscope: <Stethoscope className="text-primary" />,
  Heart: <Heart className="text-primary" />,
  Pill: <Pill className="text-primary" />,
};

export const LandingPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [servicesRes, promosRes] = await Promise.all([
      supabase.from('clinic_services').select('*').order('created_at', { ascending: true }),
      supabase.from('promos').select('*').eq('is_active', true).order('created_at', { ascending: false })
    ]);

    setServices(servicesRes.data || []);
    setPromos(promosRes.data || []);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-black/5 px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">G</div>
          <span className="text-xl font-bold text-primary">GelisCare Clinic</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#layanan" className="hover:text-primary">Layanan</a>
          <a href="#promo" className="hover:text-primary">Promo</a>
        </div>
        <div className="flex gap-4">
          {user ? (
            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'}>
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button>Daftar Pasien</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-24 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                Klinik Pratama Terakreditasi
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Kesehatan Anda adalah <span className="text-primary italic">Prioritas</span> Kami
              </h1>
              <p className="text-lg text-slate-600 mb-10">
                GelisCare Clinic menyediakan layanan kesehatan primer yang komprehensif dengan tenaga medis profesional dan fasilitas modern untuk keluarga Anda.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button className="px-8 py-3 text-lg">Daftar Antrean Online</Button>
                </Link>
                <a href="#layanan">
                  <Button variant="outline" className="px-8 py-3 text-lg">Lihat Layanan</Button>
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80" 
                alt="Clinic Interior" 
                className="rounded-2xl shadow-2xl border-8 border-white"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Buka Setiap Hari</p>
                  <p className="text-sm font-bold">08:00 - 21:00 WIB</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="layanan" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Jenis Pelayanan Kami</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Kami menyediakan berbagai layanan medis untuk memenuhi kebutuhan kesehatan Anda dan keluarga.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
            ) : (
              services.map((service) => (
                <ServiceCard 
                  key={service.id}
                  icon={iconMap[service.icon_name] || <Stethoscope className="text-primary" />}
                  title={service.title}
                  description={service.description}
                />
              ))
            )}
          </div>
        </section>

        {/* Promos Section */}
        <section id="promo" className="bg-slate-900 py-24 px-6 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Promo Kesehatan</h2>
                <p className="text-slate-400">Nikmati penawaran menarik untuk layanan kesehatan pilihan.</p>
              </div>
              <Link to="/register">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Daftar Sekarang</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-80 w-full bg-white/5" />)
              ) : (
                promos.map((promo) => (
                  <PromoCard 
                    key={promo.id}
                    image={promo.image_url}
                    title={promo.title}
                    description={promo.description}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-10 px-6 text-center text-slate-500 text-sm">
        <p>&copy; 2024 GelisCare Clinic. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
};

const ServiceCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-md border border-black/5 shadow-sm hover:shadow-md transition-shadow group">
    <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const PromoCard = ({ image, title, description }: { image: string, title: string, description: string }) => (
  <div className="group bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all">
    <div className="aspect-video overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
    </div>
    <div className="p-6">
      <h4 className="font-bold text-xl mb-2">{title}</h4>
      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{description}</p>
      <Link to="/register" className="text-primary font-bold text-sm flex items-center gap-2 group/link">
        Ambil Promo <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);
