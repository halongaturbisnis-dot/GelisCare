import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/UI';
import { Heart, Stethoscope, Pill, Clock, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage = () => {
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
          <a href="#produk" className="hover:text-primary">Produk</a>
          <a href="#kontak" className="hover:text-primary">Kontak</a>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost">Masuk</Button>
          </Link>
          <Link to="/register">
            <Button>Daftar Pasien</Button>
          </Link>
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
            <ServiceCard 
              icon={<Stethoscope className="text-primary" />}
              title="Poli Umum"
              description="Pemeriksaan kesehatan rutin, pengobatan penyakit umum, dan konsultasi medis dasar."
            />
            <ServiceCard 
              icon={<Heart className="text-primary" />}
              title="Kesehatan Ibu & Anak"
              description="Layanan imunisasi, pemeriksaan kehamilan, dan pemantauan tumbuh kembang anak."
            />
            <ServiceCard 
              icon={<Pill className="text-primary" />}
              title="Laboratorium & Farmasi"
              description="Cek darah lengkap dan apotek yang menyediakan obat-obatan berkualitas."
            />
          </div>
        </section>

        {/* Products Section */}
        <section id="produk" className="bg-slate-900 py-24 px-6 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Produk Kesehatan</h2>
                <p className="text-slate-400">Dapatkan produk kesehatan pilihan dari apotek kami.</p>
              </div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Lihat Semua</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ProductCard 
                image="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"
                name="Vitamin C 1000mg"
                price="Rp 45.000"
              />
              <ProductCard 
                image="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&w=400&q=80"
                name="Masker Medis 3-Ply"
                price="Rp 25.000"
              />
              <ProductCard 
                image="https://images.unsplash.com/photo-1616671285410-095649f87720?auto=format&fit=crop&w=400&q=80"
                name="Hand Sanitizer 500ml"
                price="Rp 35.000"
              />
              <ProductCard 
                image="https://images.unsplash.com/photo-1550572017-ed9a02799d53?auto=format&fit=crop&w=400&q=80"
                name="Termometer Digital"
                price="Rp 85.000"
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="kontak" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="bg-primary rounded-3xl p-12 text-white flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6">Butuh Bantuan Medis?</h2>
              <p className="text-white/80 mb-8 text-lg">Hubungi kami sekarang untuk konsultasi darurat atau janji temu dokter.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <span>(021) 1234-5678</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <span>Jl. Kesehatan No. 123, Jakarta Selatan</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl text-slate-900 w-full max-w-sm">
              <h3 className="font-bold text-xl mb-4">Kirim Pesan Cepat</h3>
              <div className="space-y-4">
                <input className="w-full border border-black/10 rounded-md px-4 py-2 text-sm" placeholder="Nama Anda" />
                <input className="w-full border border-black/10 rounded-md px-4 py-2 text-sm" placeholder="Nomor WhatsApp" />
                <textarea className="w-full border border-black/10 rounded-md px-4 py-2 text-sm min-h-[100px]" placeholder="Pesan Anda" />
                <Button className="w-full">Kirim Sekarang</Button>
              </div>
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

const ProductCard = ({ image, name, price }: { image: string, name: string, price: string }) => (
  <div className="group cursor-pointer">
    <div className="aspect-square rounded-xl overflow-hidden mb-4">
      <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
    </div>
    <h4 className="font-bold text-sm mb-1">{name}</h4>
    <p className="text-primary text-xs font-bold">{price}</p>
  </div>
);
