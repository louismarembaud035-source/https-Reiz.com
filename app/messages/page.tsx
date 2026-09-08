'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);

      // Enregistrer / Mettre à jour le profil de l'utilisateur connecté
      await supabase.from('Profiles').upsert({
        id: session.user.id,
        email: session.user.email
      });

      // Charger la liste des autres utilisateurs
      const { data: profilesData } = await supabase
        .from('Profiles')
        .select('*')
        .neq('id', session.user.id);

      if (profilesData) {
        setUsersList(profilesData);
      }
    }
    init();
  }, [router]);

  // Charger les messages et écouter le Realtime lorsque l'on sélectionne un destinataire
  useEffect(() => {
    if (!selectedUser || !user) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from('DirectMessages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    }
    fetchMessages();

    // Canal Realtime pour les messages privés
    const channel = supabase
      .channel(`dm-${user.id}-${selectedUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'DirectMessages',
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedUser.id) ||
            (newMsg.sender_id === selectedUser.id && newMsg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, user]);

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    const contentText = newMessage;
    setNewMessage('');

    // 1. Insérer le message
    const { error } = await supabase.from('DirectMessages').insert([
      {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: contentText
      }
    ]);

    if (error) {
      console.error('Erreur envoi message :', error);
      alert("Erreur lors de l'envoi du message.");
      return;
    }

    // 2. Envoyer une notification au destinataire
    await supabase.from('Notifications').insert([
      {
        user_id: selectedUser.id,
        content: `Nouveau message privé de ${user.email}`,
        is_read: false
      }
    ]);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-4 sm:p-12">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[80vh]">
        
        {/* Barre latérale : Liste des étudiants */}
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h1 className="font-bold text-lg text-[#2B4C7E]">Messages</h1>
            <Link href="/" className="text-xs font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {usersList.length === 0 ? (
              <p className="text-xs text-gray-400 p-4 text-center">Aucun autre étudiant inscrit pour l'instant.</p>
            ) : (
              usersList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                    selectedUser?.id === u.id
                      ? 'bg-[#2B4C7E] text-white shadow-sm'
                      : 'bg-white border border-gray-100 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <span className="text-sm font-medium truncate">{u.email}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedUser?.id === u.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#2B4C7E]'}`}>
                    Chat
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Fenêtre de discussion principale */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* En-tête de la discussion */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">Discussion avec</h3>
                  <p className="text-xs font-medium text-[#2B4C7E]">{selectedUser.email}</p>
                </div>
              </div>

              {/* Corps des messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Démarre la discussion en envoyant un premier message ci-dessous !
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? 'bg-[#2B4C7E] text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-3">
                <input
                  type="text"
                  placeholder="Écris ton message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
                >
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm font-medium text-gray-600">Sélectionne un étudiant dans la liste pour commencer à discuter en binôme.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
