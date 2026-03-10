import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Button, Input, Skeleton } from '@/components/UI';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import Swal from 'sweetalert2';

export const PromoManagement = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', image_url: '', is_active: true });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
    setPromos(data || []);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Promo Baru',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Judul Promo">' +
        '<input id="swal-input2" class="swal2-input" placeholder="URL Gambar">' +
        '<textarea id="swal-input3" class="swal2-textarea" placeholder="Deskripsi"></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: (document.getElementById('swal-input1') as HTMLInputElement).value,
          image_url: (document.getElementById('swal-input2') as HTMLInputElement).value,
          description: (document.getElementById('swal-input3') as HTMLTextAreaElement).value,
        }
      }
    });

    if (formValues && formValues.title) {
      const { error } = await supabase.from('promos').insert(formValues);
      if (error) Swal.fire('Error', error.message, 'error');
      else fetchPromos();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Promo?',
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('promos').delete().eq('id', id);
      if (error) Swal.fire('Error', error.message, 'error');
      else fetchPromos();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('promos').update({ is_active: !currentStatus }).eq('id', id);
    if (error) Swal.fire('Error', error.message, 'error');
    else fetchPromos();
  };

  const startEdit = (promo: any) => {
    setIsEditing(promo.id);
    setEditForm({ 
      title: promo.title, 
      description: promo.description, 
      image_url: promo.image_url,
      is_active: promo.is_active 
    });
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase.from('promos').update(editForm).eq('id', id);
    if (error) Swal.fire('Error', error.message, 'error');
    else {
      setIsEditing(null);
      fetchPromos();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Promo</h1>
        <Button onClick={handleAdd} className="gap-2">
          <Plus size={18} /> Tambah Promo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
        ) : (
          promos.map((promo) => (
            <Card key={promo.id} className="p-0 overflow-hidden group">
              <div className="aspect-video relative overflow-hidden bg-slate-200">
                {promo.image_url ? (
                  <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(promo)} className="p-2 bg-white rounded-full shadow-lg text-slate-600 hover:text-primary">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="p-2 bg-white rounded-full shadow-lg text-slate-600 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <button 
                    onClick={() => toggleStatus(promo.id, promo.is_active)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg ${
                      promo.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                    }`}
                  >
                    {promo.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {promo.is_active ? 'Aktif' : 'Non-Aktif'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isEditing === promo.id ? (
                  <div className="space-y-3">
                    <Input 
                      value={editForm.title} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      placeholder="Judul Promo"
                    />
                    <Input 
                      value={editForm.image_url} 
                      onChange={e => setEditForm({...editForm, image_url: e.target.value})}
                      placeholder="URL Gambar"
                    />
                    <textarea 
                      className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={editForm.description} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Deskripsi"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(promo.id)} className="flex-1 gap-1">
                        <Save size={16} /> Simpan
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(null)} className="flex-1 gap-1">
                        <X size={16} /> Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-xl mb-2">{promo.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{promo.description}</p>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
