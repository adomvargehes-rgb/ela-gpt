import React, { useState } from 'react';
import {
  Plus,
  FolderGit2,
  MessageSquare,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  Trash2,
  Edit3,
  Sparkles
} from 'lucide-react';
import { Conversation } from '@/types';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onOpenSearch,
  onOpenSettings,
  isOpen,
  onToggleOpen,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay when sidebar is open */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 md:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#f9fafb] border-r border-neutral-200/80 flex flex-col transition-all duration-300 md:relative md:translate-x-0 shadow-sm ${isOpen ? 'w-[260px] translate-x-0' : '-translate-x-full md:w-16 md:translate-x-0 overflow-hidden'}`}>

        {/* Header / Brand */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-neutral-200/60 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            {isOpen && (
              <span className="font-semibold text-neutral-950 tracking-tight truncate text-xs">
                Ela GPT Platform
              </span>
            )}
          </div>
          <button
            onClick={onToggleOpen}
            className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition-colors"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Actions (8px grid spacing) */}
        <div className="p-3 space-y-1.5 shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl shadow-2xs transition-all text-left"
            title="New Task / Chat"
          >
            <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
            {isOpen && <span className="truncate">New Task / Chat</span>}
          </button>

          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-xl transition-colors text-left"
            title="Search Conversations"
          >
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            {isOpen && <span className="truncate">Search Conversations...</span>}
          </button>
        </div>

        {/* Navigation items */}
        <div className="px-3 py-1.5 space-y-0.5 text-xs font-medium text-neutral-600 border-b border-neutral-200/60 pb-3 shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-neutral-200/50 hover:text-neutral-900 transition-colors"
            title="New Task"
          >
            <Compass className="w-4 h-4 text-neutral-400 shrink-0" />
            {isOpen && <span>New Task</span>}
          </button>

          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-neutral-200/50 hover:text-neutral-900 transition-colors"
            title="Projects"
          >
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-neutral-400 shrink-0" />
              {isOpen && <span>Projects</span>}
            </div>
            {isOpen && <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-200/60 px-1.5 py-0.2 rounded-full font-semibold">Beta</span>}
          </button>

          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-neutral-200/50 hover:text-neutral-900 transition-colors"
            title="Discussion"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-neutral-400 shrink-0" />
              {isOpen && <span>Discussion</span>}
            </div>
            {isOpen && <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-200/60 px-1.5 py-0.2 rounded-full font-semibold">Beta</span>}
          </button>
        </div>

        {/* Folders & Recent Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {isOpen && (
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Folders
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 font-medium bg-neutral-200/60 rounded-xl shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="truncate">better-harness</span>
                </div>
              </div>
            </div>
          )}

          <div>
            {isOpen && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Recent Conversations
              </div>
            )}
            <div className="space-y-0.5">
              {conversations.length === 0 && isOpen && (
                <div className="px-3 py-2 text-xs text-neutral-400 italic">No recent chats</div>
              )}
              {conversations.map((conv) => {
                const isActive = conv.id === currentConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`group relative flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-neutral-200/80 text-neutral-900 font-semibold shadow-2xs'
                        : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900'
                    }`}
                    title={conv.title}
                  >
                    {editingId === conv.id ? (
                      <form onSubmit={(e) => handleSaveRename(conv.id, e)} className="flex-1 mr-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          className="w-full px-2 py-0.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </form>
                    ) : (
                      <span className="truncate pr-10">{conv.title}</span>
                    )}

                    {isOpen && editingId !== conv.id && (
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l from-neutral-100 pl-2">
                        <button
                          onClick={(e) => handleStartRename(conv, e)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
                          title="Rename"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => onDeleteConversation(conv.id, e)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer / Settings & Profile */}
        <div className="p-3 border-t border-neutral-200/60 space-y-1.5 bg-[#f4f5f6] shrink-0">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-neutral-400 shrink-0" />
            {isOpen && <span>Settings</span>}
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-neutral-800">
            <div className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs">
              DG
            </div>
            {isOpen && (
              <div className="truncate">
                <div className="font-semibold text-neutral-900 truncate">Developer</div>
                <div className="text-[10px] text-neutral-400 truncate">developer@elagpt.ai</div>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
