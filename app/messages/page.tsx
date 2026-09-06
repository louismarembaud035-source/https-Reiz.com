'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Messages() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Thomas D.', text: 'Salut ! Tu as compris l exercice de physique sur les ondes ?', time: '14:20' },
    { id: 2, sender: 'Moi', text: 'Oui, je peux t envoyer ma fiche de révision si tu veux.', time: '14:22' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'Moi', text: input, time: '14:25' }]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold tracking-tight text-[#2B4C7E]">Messagerie - Reiz</h1>
        <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Retour au fil
        </Link>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-between">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto mb-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'Moi' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-xs text-gray-500 mb-1">{msg.sender} • {msg.time}</span>
                <div
                  className={`p-3 rounded-2xl text-sm max-w-md ${
                    msg.sender === 'Moi'
                      ? 'bg-[#2B4C7E] text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-gray-100">
            <input
              type="text"
              placeholder="Écris ton message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
            />
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#2B4C7E] rounded-xl hover:bg-[#20375E] transition"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
