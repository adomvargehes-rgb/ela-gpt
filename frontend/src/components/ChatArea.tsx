import React, { useRef, useEffect } from 'react';
import { Message, Conversation } from '@/types';
import MessageList from './MessageList';
import { Sparkles, Code, Cpu, Terminal, Compass } from 'lucide-react';

interface ChatAreaProps {
  conversation: Conversation | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  onQuickPrompt: (prompt: string) => void;
}

export default function ChatArea({
  conversation,
  isGenerating,
  onRegenerate,
  onQuickPrompt,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isGenerating]);

  const messages = conversation?.messages || [];

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#121212] flex flex-col relative">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto my-auto pb-48 w-full">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight text-center">What would you like to build today?</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-md leading-relaxed text-center">
            Ela GPT platform is ready to assist you with full-stack architecture, FastAPI backend services, Next.js frontend, and real AI integrations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
            <button
              onClick={() => onQuickPrompt("Build a FastAPI REST endpoint with SQLAlchemy for user authentication")}
              className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100 mb-1.5">
                <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>FastAPI Backend Service</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">Create REST endpoints with Pydantic validation</p>
            </button>

            <button
              onClick={() => onQuickPrompt("Create a responsive Next.js dashboard with Tailwind CSS and collapsible sidebar")}
              className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100 mb-1.5">
                <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Next.js Dashboard UI</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">Responsive frontend layout & workspace</p>
            </button>

            <button
              onClick={() => onQuickPrompt("Explain the modular AI provider architecture for switching between mock and OpenAI")}
              className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100 mb-1.5">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>AI Provider Architecture</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">Learn how adapters and mock providers work</p>
            </button>

            <button
              onClick={() => onQuickPrompt("How do I setup Server-Sent Events (SSE) for streaming AI responses?")}
              className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 font-semibold text-xs text-neutral-900 dark:text-neutral-100 mb-1.5">
                <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>SSE Streaming Responses</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">Implement real-time token streaming</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 pb-36">
          <MessageList messages={messages} onRegenerate={onRegenerate} isGenerating={isGenerating} />
          {isGenerating && (
            <div className="py-4 px-8 flex items-center gap-3 bg-[#fcfcfc] dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-xs animate-pulse">
              <div className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Ela GPT is generating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
