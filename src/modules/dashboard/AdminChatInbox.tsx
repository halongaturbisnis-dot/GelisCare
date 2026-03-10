import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, Skeleton, Input } from '@/components/UI';
import { Search, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const AdminChatInbox = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChats();
    
    // Realtime subscription for new messages to update the list
    const subscription = supabase
      .channel('inbox_updates')
      .on('postgres_changes' as any, { event: 'INSERT', table: 'messages' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchChats = async () => {
    // Fetch all patients and their unread message counts
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('last_message_at', { ascending: false });

    if (profiles) {
      // For each profile, get unread count
      const chatsWithUnread = await Promise.all(profiles.map(async (p) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', p.id)
          .eq('is_read', false);
        
        // Get last message content
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .or(`sender_id.eq.${p.id},receiver_id.eq.${p.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...p,
          unreadCount: count || 0,
          lastMessage: lastMsg?.content || 'Belum ada pesan',
          lastMessageTime: lastMsg?.created_at || p.last_message_at
        };
      }));

      setChats(chatsWithUnread);
    }
    setIsLoading(false);
  };

  const filteredChats = chats.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nik?.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Inbox Chat Pasien</h1>
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <Clock size={16} /> Update otomatis
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-black/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Cari Nama atau NIK Pasien..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-black/5">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Link 
                key={chat.id} 
                to={`/admin/chat/${chat.id}`}
                className="p-4 flex gap-4 items-center hover:bg-slate-50 transition-colors group"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {chat.full_name?.charAt(0)}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                      UNREAD
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm truncate">{chat.full_name}</h3>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {format(new Date(chat.lastMessageTime), 'HH:mm', { locale: id })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                <MessageSquare size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
              </Link>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400">
              Tidak ada percakapan ditemukan
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
