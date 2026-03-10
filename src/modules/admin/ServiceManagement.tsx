import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Button, Input, Skeleton } from '@/components/UI';
import { Plus, Trash2, Edit2, Save, X, Stethoscope, Heart, Pill } from 'lucide-react';
import Swal from 'sweetalert2';

export const ServiceManagement = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', icon_name: 'Stethoscope' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('clinic_services').select('*').order('created_at', { ascending: true });
    setServices(data || []);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Layanan Baru',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nama Layanan">' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="Deskripsi"></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: (document.getElementById('swal-input1') as HTMLInputElement).value,
          description: (document.getElementById('swal-input2') as HTMLTextAreaElement).value,
          icon_name: 'Stethoscope'
        }
      }
    });

    if (formValues && formValues.title) {
      const { error } = await supabase.from('clinic_services').insert(formValues);
      if (error) Swal.fire('Error', error.message, 'error');
      else fetchServices();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Layanan?',
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('clinic_services').delete().eq('id', id);
      if (error) Swal.fire('Error', error.message, 'error');
      else fetchServices();
    }
  };

  const startEdit = (service: any) => {
    setIsEditing(service.id);
    setEditForm({ title: service.title, description: service.description, icon_name: service.icon_name });
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase.from('clinic_services').update(editForm).eq('id', id);
    if (error) Swal.fire('Error', error.message, 'error');
    else {
      setIsEditing(null);
      fetchServices();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Layanan</h1>
        <Button onClick={handleAdd} className="gap-2">
          <Plus size={18} /> Tambah Layanan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : (
          services.map((service) => (
            <Card key={service.id} className="relative group">
              {isEditing === service.id ? (
                <div className="space-y-3">
                  <Input 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Nama Layanan"
                  />
                  <textarea 
                    className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={editForm.description} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Deskripsi"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(service.id)} className="flex-1 gap-1 py-1">
                      <Save size={14} /> Simpan
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(null)} className="flex-1 gap-1 py-1">
                      <X size={14} /> Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                      {service.icon_name === 'Stethoscope' && <Stethoscope size={20} />}
                      {service.icon_name === 'Heart' && <Heart size={20} />}
                      {service.icon_name === 'Pill' && <Pill size={20} />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(service)} className="p-1.5 text-slate-400 hover:text-blue-500">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
