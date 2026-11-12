'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, AIModel, Message } from '@/types';
import {
  fetchModels,
  fetchConversations,
  createConversation,
  updateConversation,
  deleteConversationApi,
  sendMessageApi
} from '@/services/api';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import ChatComposer from '@/components/ChatComposer';
import SearchModal from '@/components/SearchModal';
import SettingsModal from '@/components/SettingsModal';
import { Menu, Share2, MoreHorizontal, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('ela-gpt-v4-turbo');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial data
  useEffect(() => {
    async function init() {
      const loadedModels = await fetchModels();
      setModels(loadedModels);
      if (loadedModels.length > 0) {
        setCurrentModel(loadedModels[0].id);
      }

      const loadedConvs = await fetchConversations();
      setConversations(loadedConvs);

      // Check if URL specifies a conversation ID (e.g. ?c=uuid)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlConvId = urlParams.get('c');
        if (urlConvId && loadedConvs.some(c => c.id === urlConvId)) {
          setCurrentId(urlConvId);
        } else {
          // Default to clean New Chat screen on fresh session / launch
          setCurrentId(null);
        }
      }
    }
    init();
  }, []);

  const currentConversation = conversations.find(c => c.id === currentId) || null;

  const handleNewChat = () => {
    setCurrentId(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentId(id);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `?c=${encodeURIComponent(id)}`);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversationApi(id);
      setConversations(prev => {
        const updated = prev.filter(c => c.id !== id);
        if (currentId === id) {
          setCurrentId(null);
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', window.location.pathname);
          }
        }
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const updated = await updateConversation(id, { title: newTitle });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: updated.title } : c));
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    let targetConvId = currentId;

    // If no active conversation (New Chat screen), create a new conversation
    if (!targetConvId) {
      try {
        const title = (text.length > 30 ? text.slice(0, 30) + '...' : text);
        const newConv = await createConversation(title, currentModel, "Coding");
        targetConvId = newConv.id;
        setConversations(prev => [newConv, ...prev]);
        setCurrentId(newConv.id);
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', `?c=${encodeURIComponent(newConv.id)}`);
        }
      } catch (e) {
        console.error('Failed to create conversation for message:', e);
        return;
      }
    }

    // Optimistically add user message and temporary assistant placeholder
    const userMsgId = 'temp-user-' + Date.now();
    const assistantMsgId = 'temp-assistant-' + Date.now();
    const nowISO = new Date().toISOString();

    const userMessage: Message = {
      id: userMsgId,
      conversation_id: targetConvId,
      role: 'user',
      content: text,
      created_at: nowISO,
    };

    const assistantPlaceholder: Message = {
      id: assistantMsgId,
      conversation_id: targetConvId,
      role: 'assistant',
      content: '',
      created_at: nowISO,
    };

    setConversations(prev => prev.map(c => {
      if (c.id === targetConvId) {
        return {
          ...c,
          title: c.messages.length === 0 ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : c.title,
          messages: [...c.messages, userMessage, assistantPlaceholder],
          updated_at: nowISO,
        };
      }
      return c;
    }));

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      // Stream response over relative or configured API endpoint
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
      const url = `${apiBase}/chat/stream?conversation_id=${encodeURIComponent(targetConvId)}&message=${encodeURIComponent(text)}&model=${encodeURIComponent(currentModel)}`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedContent += data.chunk;
                setConversations(prev => prev.map(c => {
                  if (c.id === targetConvId) {
                    const msgs = [...c.messages];
                    const lastMsg = msgs[msgs.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = accumulatedContent;
                    }
                    return { ...c, messages: msgs };
                  }
                  return c;
                }));
              }
              if (data.done) {
                const freshConvs = await fetchConversations();
                setConversations(freshConvs);
              }
            } catch (err) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Streaming error, falling back to REST:', err);
        try {
          await sendMessageApi(targetConvId, text, currentModel);
          const freshConvs = await fetchConversations();
          setConversations(freshConvs);
        } catch (fallbackErr) {
          console.error('Fallback failed:', fallbackErr);
        }
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentConversation || currentConversation.messages.length === 0 || isGenerating) return;
    const messages = currentConversation.messages;
    let lastUserMsgIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMsgIndex = i;
        break;
      }
    }
    if (lastUserMsgIndex !== -1) {
      const lastUserText = messages[lastUserMsgIndex].content;
      const truncatedMessages = messages.slice(0, lastUserMsgIndex);
      setConversations(prev => prev.map(c => c.id === currentId ? { ...c, messages: truncatedMessages } : c));
      await handleSendMessage(lastUserText);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className={`flex h-screen bg-white overflow-hidden ${theme === 'dark' ? 'dark bg-[#121212] text-neutral-100' : ''}`}>

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between bg-white dark:bg-[#1e1e1e] dark:border-neutral-800 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate max-w-xs md:max-w-md">
                {currentConversation?.title || 'New Task'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {currentModel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentConversation) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Conversation link copied to clipboard!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Workspace Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <ChatArea
            conversation={currentConversation}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onQuickPrompt={handleQuickPrompt}
          />

          {/* AI Message Composer */}
          <ChatComposer
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isGenerating={isGenerating}
            models={models}
            currentModel={currentModel}
            onSelectModel={setCurrentModel}
          />
        </div>

      </div>

      {/* Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultModel={currentModel}
        onUpdateDefaultModel={setCurrentModel}
        theme={theme}
        onUpdateTheme={setTheme}
      />

    </div>
  );
}
