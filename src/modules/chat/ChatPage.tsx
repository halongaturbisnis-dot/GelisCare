import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, Skeleton } from '@/components/UI';
import { cn } from '@/utils/ui';
import { Send, Paperclip, Image as ImageIcon, FileText, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

export const ChatPage = () => {
  const { user, profile } = useAuth();
  const { patientId } = useParams(); // For admin view
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine who we are chatting with
  const targetUserId = profile?.role === 'admin' ? patientId : null;

  useEffect(() => {
    if (profile?.role === 'admin' && patientId) {
      fetchPatientProfile();
    }
    fetchMessages();
    markAsRead();

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes' as any, { event: 'INSERT', table: 'messages' }, (payload: any) => {
        // Only add if it's relevant to this chat
        const isRelevant = profile?.role === 'admin' 
          ? (payload.new.sender_id === patientId || payload.new.receiver_id === patientId)
          : (payload.new.sender_id === user?.id || payload.new.receiver_id === user?.id);
        
        if (isRelevant) {
          setMessages(prev => [...prev, payload.new]);
          markAsRead();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [patientId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchPatientProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', patientId).single();
    setChatPartner(data);
  };

  const fetchMessages = async () => {
    let query = supabase.from('messages').select('*');
    
    if (profile?.role === 'admin' && patientId) {
      query = query.or(`sender_id.eq.${patientId},receiver_id.eq.${patientId}`);
    } else if (user) {
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    }

    const { data } = await query.order('created_at', { ascending: true });
    setMessages(data || []);
    setIsLoading(false);
  };

  const markAsRead = async () => {
    if (!user) return;
    
    // Mark messages sent to me as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;

    const receiverId = profile?.role === 'admin' ? patientId : null;

    const optimisticMessage = {
      id: Math.random().toString(),
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage,
      created_at: new Date().toISOString(),
      is_optimistic: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage,
      });
      if (error) throw error;

      // Update last_message_at for the patient profile to bubble up in inbox
      const profileToUpdate = profile?.role === 'admin' ? patientId : user.id;
      await supabase.from('profiles').update({ last_message_at: new Date().toISOString() }).eq('id', profileToUpdate);

    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      Swal.fire('Error', 'Gagal mengirim pesan', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSending(true);
    const receiverId = profile?.role === 'admin' ? patientId : null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: '',
        attachment_url: publicUrl,
        attachment_type: file.type.startsWith('image/') ? 'image' : 'file',
      });

      const profileToUpdate = profile?.role === 'admin' ? patientId : user.id;
      await supabase.from('profiles').update({ last_message_at: new Date().toISOString() }).eq('id', profileToUpdate);

    } catch (error: any) {
      Swal.fire('Error', 'Gagal mengunggah file', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-black/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {profile?.role === 'admin' && (
            <button onClick={() => window.history.back()} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {profile?.role === 'admin' ? (chatPartner?.full_name?.charAt(0) || 'P') : 'A'}
          </div>
          <div>
            <h2 className="font-bold text-sm">
              {profile?.role === 'admin' ? (chatPartner?.full_name || 'Memuat...') : 'Admin GelisCare'}
            </h2>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className="w-48 h-12" />
            </div>
          ))
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={cn(
                "max-w-[80%] rounded-md p-3 shadow-sm",
                msg.sender_id === user?.id ? "bg-primary text-white" : "bg-white text-slate-800"
              )}>
                {msg.attachment_url && (
                  <div className="mb-2">
                    {msg.attachment_type === 'image' ? (
                      <img 
                        src={msg.attachment_url} 
                        alt="attachment" 
                        className="rounded-md max-h-60 object-cover cursor-pointer"
                        onClick={() => window.open(msg.attachment_url)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <a 
                        href={msg.attachment_url} 
                        target="_blank" 
                        className="flex items-center gap-2 bg-black/5 p-2 rounded-md text-xs"
                      >
                        <FileText size={16} />
                        <span className="truncate">Dokumen Lampiran</span>
                      </a>
                    )}
                  </div>
                )}
                <div className="text-sm prose prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <p className={cn("text-[10px] mt-1 text-right opacity-70")}>
                  {format(new Date(msg.created_at), 'HH:mm', { locale: id })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-black/5 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <Input 
            placeholder="Ketik pesan... (Gunakan markdown: *bold*, _italic_)" 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};
