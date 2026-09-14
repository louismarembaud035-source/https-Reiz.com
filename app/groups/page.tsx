'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, 
  Plus, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  UserPlus, 
  MessageSquare, 
  Shield,
  Check
} from 'lucide-react';

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
  
  // États pour la création de groupe et l'ajout de membres façon Instagram
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

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
      fetchProfiles(session.user.id);
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

  async function fetchProfiles(currentUserId: string) {
    const { data } = await supabase
      .from('Profiles')
      .select('*')
      .neq('id', currentUserId);
    if (data) setAllProfiles(data);
  }

  // Charger les messages du groupe sélectionné
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

  const toggleMemberSelection = (profileId: string) => {
    if (selectedMembers.includes(profileId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== profileId));
    } else {
      setSelectedMembers([...selectedMembers, profileId]);
    }
  };

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
      // Si des membres ont été sélectionnés, les ajouter
      if (data && selectedMembers.length > 0) {
        const memberInserts = selectedMembers.map(memberId => ({
          group_id: data.id,
          user_id: memberId
        }));
        await supabase.from('GroupMembers').insert(memberInserts);
      }

      setName('');
      setSubject('');
      setDescription('');
      setSelectedMembers([]);
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
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">Groupes d'étude</h1>
              <p className="text-xs text-slate-400">Révisez en communauté avec vos camarades</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5 shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Accueil
          </Link>
        </div>

        {/* Groups Interface Container */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[72vh]">
          
          {/* Sidebar : Liste des groupes */}
          <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col bg-slate-50/50">
            
            <div className="p-4 border-b border-slate-200/80 bg-white/60">
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Créer un groupe
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              {groups.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center">Aucun groupe pour l'instant. Créez le premier !</p>
              ) : (
                groups.map((g) => {
                  const isSelected = selectedGroup?.id === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15'
                          : 'bg-white border border-slate-200/60 hover:bg-slate-100/80 text-slate-800'
                      }`}
                    >
                      <span className="text-xs font-extrabold truncate">{g.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full w-max font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {g.subject}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Espace de discussion principal du groupe */}
          <div className="flex-1 flex flex-col bg-white/40">
            {selectedGroup ? (
              <>
                {/* En-tête du groupe */}
                <div className="px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="font-extrabold text-sm text-slate-900">{selectedGroup.name}</h2>
                    <p className="text-[11px] text-slate-500">{selectedGroup.description || selectedGroup.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {selectedGroup.subject}
                    </span>
                  </div>
                </div>

                {/* Liste des messages du groupe */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
                        👥
                      </div>
                      <p className="font-semibold text-slate-600">Ce groupe est calme...</p>
                      <p className="text-[11px] text-slate-400">Envoyez le premier message pour lancer la discussion !</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id || msg.user_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-slate-400 mb-1 px-1 font-semibold">
                            {msg.user_email || 'Étudiant'}
                          </span>
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
                    placeholder="Écrivez un message au groupe..."
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
                  👥
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Aucun groupe sélectionné</h4>
                  <p className="text-xs text-slate-400 mt-1">Sélectionnez ou créez un groupe d'étude pour commencer à échanger.</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modale de création de groupe avec sélection de membres façon Instagram */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900">Créer un groupe d'étude</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom du groupe</label>
                <input
                  type="text"
                  placeholder="ex: Prépa Maths MPSI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Matière / Filière</label>
                <input
                  type="text"
                  placeholder="ex: Mathématiques"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (optionnelle)</label>
                <textarea
                  placeholder="Objectif du groupe, horaires de révision..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Sélection des membres façon Instagram */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ajouter des membres ({selectedMembers.length} sélectionnés)</label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {allProfiles.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Aucun autre étudiant disponible.</p>
                  ) : (
                    allProfiles.map((p) => {
                      const isSelected = selectedMembers.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleMemberSelection(p.id)}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition text-xs font-semibold ${
                            isSelected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="truncate max-w-[240px]">{p.email}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  Créer le groupe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
