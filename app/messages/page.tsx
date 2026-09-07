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

    // Actualisation temps réel avec Supabase
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
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* Header style Insta / Snap */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-xs">
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
            ← Retour
          </Link>
          <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-200">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full p-[2px]">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#2B4C7E] text-xs">
                  T
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-tight text-gray-900">Thomas D.</h2>
              <p className="text-[11px] text-gray-400">Actif il y a 2 min</p>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#2B4C7E] bg-blue-50 px-3 py-1 rounded-full">
          Discussion
        </span>
      </header>

      {/* Corps de la conversation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-[#F9FAFB]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16">
            Aucun message. Envoie un premier message pour lancer la discussion !
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === 'Moi';
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-md px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#2B4C7E] text-white rounded-2xl rounded-br-xs'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {isMe ? 'Moi' : msg.sender}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barre d'écriture en bas */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Envoyer un message..."
          className="flex-1 bg-gray-100 border border-transparent focus:border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none transition"
        />
        <button
          type="submit"
          className="bg-[#2B4C7E] hover:bg-[#20375E] text-white px-6 py-3 rounded-full text-sm font-semibold transition shadow-sm"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
