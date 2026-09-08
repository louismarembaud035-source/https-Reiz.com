'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GroupsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // États pour la modale de création de groupe
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      fetchGroups();
    }
    init();
  }, [router]);

  async function fetchGroups() {
    const { data, error } = await supabase
      .from('StudyGroups')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGroups(data);
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
      }
    }
  }

  // Charger les messages et écouter le Realtime du groupe sélectionné
  useEffect(() => {
    if (!selectedGroup) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from('GroupMessages')
        .select('*')
        .eq('group_id', selectedGroup.id)
        .order('created_at', { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    }
    fetchMessages();

    const channel = supabase
      .channel(`group-${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'GroupMessages',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !subject.trim()) {
      alert('Veuillez remplir le nom et la matière.');
      return;
    }

    const { data, error } = await supabase.from('StudyGroups').insert([
      {
        name,
        subject,
        description,
        user_id: user.id
      }
    ]).select().single();

    if (error) {
      console.error('Erreur création groupe :', error);
      alert('Erreur lors de la création du groupe.');
    } else {
      setName('');
      setSubject('');
      setDescription('');
      setShowModal(false);
      fetchGroups();
      if (data) setSelectedGroup(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !user) return;

    const contentText = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('GroupMessages').insert([
      {
        group_id: selectedGroup.id,
        user_id: user.id,
        user_email: user.email,
        content: contentText
      }
    ]);

    if (error) {
      console.error('Erreur envoi message groupe :', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-4 sm:p-12">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[82vh]">
        
        {/* Barre latérale : Liste des groupes */}
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <div>
              <h1 className="font-bold text-lg text-[#2B4C7E]">Groupes d'étude</h1>
              <p className="text-[11px] text-gray-500">Révisez en communauté</p>
            </div>
            <Link href="/" className="text-xs font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>

          <div className="p-3 border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2.5 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
            >
              + Créer un groupe
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {groups.length === 0 ? (
              <p className="text-xs text-gray-400 p-4 text-center">Aucun groupe pour l'instant. Créez le premier !</p>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g)}
                  className={`w-full text-left p-3.5 rounded-xl transition flex flex-col gap-1 ${
                    selectedGroup?.id === g.id
                      ? 'bg-[#2B4C7E] text-white shadow-sm'
                      : 'bg-white border border-gray-100 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <span className="text-sm font-semibold truncate">{g.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full w-max ${selectedGroup?.id === g.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#2B4C7E]'}`}>
                    {g.subject}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Espace de discussion principal du groupe */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedGroup ? (
            <>
              {/* En-tête du groupe */}
              <div className="p-4 border-b border-gray-200 bg-white flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-base text-gray-900">{selectedGroup.name}</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#2B4C7E] rounded-full">
                    {selectedGroup.subject}
                  </span>
                </div>
                {selectedGroup.description && (
                  <p className="text-xs text-gray-500">{selectedGroup.description}</p>
                )}
              </div>

              {/* Liste des messages du groupe */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Ce groupe est calme... Envoyez le premier message pour lancer la discussion !
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id || msg.user_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-gray-400 mb-1 px-1">
                          {msg.user_email || 'Étudiant'}
                        </span>
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

              {/* Formulaire d'envoi de message */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-3">
                <input
                  type="text"
                  placeholder="Écrivez un message au groupe..."
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
              <span className="text-3xl mb-2">👥</span>
              <p className="text-sm font-medium text-gray-600">Sélectionnez ou créez un groupe d'étude pour commencer à échanger.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modale de création de groupe */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#2B4C7E]">Créer un groupe d'étude</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom du groupe</label>
                <input
                  type="text"
                  placeholder="ex: Prépa Maths MPSI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matière / Filière</label>
                <input
                  type="text"
                  placeholder="ex: Mathématiques"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (optionnelle)</label>
                <textarea
                  placeholder="Objectif du groupe, horaires de révision..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
