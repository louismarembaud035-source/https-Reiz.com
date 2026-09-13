'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Radio, 
  CheckCheck 
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12 relative overflow-hidden flex flex-col justify-center">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">Messagerie Privée</h1>
              <p className="text-xs text-slate-400">Discute en direct avec les membres de ta promotion</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5 shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Accueil
          </Link>
        </div>

        {/* Messaging Interface Container */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[72vh]">
          
          {/* Sidebar : Liste des étudiants */}
          <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col bg-slate-50/50">
            
            <div className="p-4 border-b border-slate-200/80 space-y-3 bg-white/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Étudiants ({usersList.length})</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                </span>
              </div>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center">Aucun étudiant trouvé.</p>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  const initial = u.email ? u.email[0].toUpperCase() : 'U';

                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15'
                          : 'bg-white border border-slate-200/60 hover:bg-slate-100/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {initial}
                        </div>
                        <span className="text-xs font-bold truncate">{u.email}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}>
                        Chat
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Fenêtre de discussion principale */}
          <div className="flex-1 flex flex-col bg-white/40">
            {selectedUser ? (
              <>
                {/* En-tête de la discussion active */}
                <div className="px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      {selectedUser.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{selectedUser.email}</h3>
                      <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> En ligne
                      </p>
                    </div>
                  </div>
                </div>

                {/* Corps des messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
                        👋
                      </div>
                      <p className="font-semibold text-slate-600">Démarre la discussion avec {selectedUser.email}</p>
                      <p className="text-[11px] text-slate-400">Envoie ton premier message ci-dessous.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-500/10'
                                : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className={`text-[9px] block mt-1.5 text-right font-medium ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Formulaire d'envoi de message */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-sm flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Écris ton message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <span>Envoyer</span> <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
                  💬
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Aucune discussion sélectionnée</h4>
                  <p className="text-xs text-slate-400 mt-1">Sélectionne un étudiant dans la liste de gauche pour lancer le chat.</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
