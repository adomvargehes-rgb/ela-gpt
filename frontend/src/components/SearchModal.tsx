import React, { useState } from 'react';
import { Search, X, MessageSquare } from 'lucide-react';
import { Conversation } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center px-4 py-3 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all conversations and messages..."
            autoFocus
            className="w-full text-sm bg-transparent border-none focus:outline-none text-neutral-900 placeholder-neutral-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-neutral-100">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-400">
              No matching conversations found.
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                className="p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-neutral-900 truncate">{conv.title}</div>
                  <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : 'No messages'}
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Press ESC to close</span>
          <span>{filtered.length} results</span>
        </div>

      </div>
    </div>
  );
}
