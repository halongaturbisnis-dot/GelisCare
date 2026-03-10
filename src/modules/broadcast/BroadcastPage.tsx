import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card } from '@/components/UI';
import { Megaphone, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { showGlobalLoader, hideGlobalLoader } from '@/utils/ui';
import Swal from 'sweetalert2';

export const BroadcastPage = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<{ url: string, type: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    showGlobalLoader();
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `broadcasts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      setAttachment({
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    } catch (error: any) {
      Swal.fire('Error', 'Gagal mengunggah file', 'error');
    } finally {
      hideGlobalLoader();
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSending(true);
    showGlobalLoader();

    try {
      // 1. Save to broadcasts table
      const { error: broadcastError } = await supabase.from('broadcasts').insert({
        admin_id: user.id,
        content,
        attachment_url: attachment?.url,
        attachment_type: attachment?.type,
      });

      if (broadcastError) throw broadcastError;

      // 2. Mock sending to all patients (In real app, this might trigger a server-side function)
      // For now, we just show success
      
      Swal.fire({
        icon: 'success',
        title: 'Broadcast Terkirim',
        text: 'Pesan telah dikirim ke seluruh pasien.',
        confirmButtonColor: '#006E62',
      });

      setContent('');
      setAttachment(null);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSending(false);
      hideGlobalLoader();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Broadcast Pesan</h1>
          <p className="text-sm text-slate-500">Kirim pengumuman ke seluruh database pasien</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSendBroadcast} className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Isi Pesan</label>
            <textarea 
              className="w-full border border-black/10 rounded-md p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[150px]"
              placeholder="Tulis pengumuman di sini... (Mendukung markdown)"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          {attachment && (
            <div className="relative border border-black/5 rounded-md p-4 bg-slate-50 flex items-center gap-4">
              {attachment.type === 'image' ? (
                <img src={attachment.url} className="w-20 h-20 object-cover rounded-md" alt="preview" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-20 h-20 bg-white border border-black/5 rounded-md flex items-center justify-center">
                  <Paperclip className="text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase">Lampiran Terpilih</p>
                <p className="text-sm text-slate-800 truncate">{attachment.url.split('/').pop()}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setAttachment(null)}
                className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} /> Lampirkan File
            </Button>
            <Button type="submit" className="flex-[2] gap-2" isLoading={isSending}>
              <Megaphone size={18} /> Kirim Broadcast
            </Button>
          </div>
        </form>
      </Card>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Tips:</strong> Gunakan broadcast untuk menginformasikan jadwal libur, promo kesehatan, atau update layanan terbaru kepada seluruh pasien Anda secara instan.
        </p>
      </div>
    </div>
  );
};
