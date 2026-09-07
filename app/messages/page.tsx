'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('Messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Erreur chargement messages :', error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:Messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('Messages').insert([
      { content, sender: 'Moi' }
    ]);

    if (error) {
      console.error('Erreur envoi message :', error);
    } else {
      fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F6F9] text-gray-900 font-sans">
      {/* Header style Studio / Espace d'étude Reiz */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-[#2B4C7E] uppercase tracking-wider transition">
            ← Tableau de bord
          </Link>
          <div className="pl-4 border-l border-gray-200">
            <h1 className="font-bold text-base text-[#2B4C7E]">Session d'entraide générale</h1>
            <p className="text-xs text-gray-500">Pose tes questions et partage tes astuces de révision</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-blue-50 text-[#2B4C7E] px-3 py-1.5 rounded-lg text-xs font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Salon actif</span>
        </div>
      </header>

      {/* Corps des messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-xs p-8">
            <h3 className="font-semibold text-gray-800 mb-1">Aucun message pour le moment</h3>
            <p className="text-sm text-gray-500">Lance la conversation avec les autres étudiants !</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === 'Moi';
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-xs font-medium text-gray-500 mb-1 ml-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-lg px-5 py-3 text-sm rounded-2xl shadow-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#2B4C7E] text-white rounded-tr-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barre de saisie épurée */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écris ton message ou pose une question sur un cours..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none transition"
          />
          <button
            type="submit"
            className="bg-[#2B4C7E] hover:bg-[#20375E] text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
