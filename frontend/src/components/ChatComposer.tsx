import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Square, ChevronDown, Sparkles } from 'lucide-react';
import { AIModel } from '@/types';

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  models: AIModel[];
  currentModel: string;
  onSelectModel: (modelId: string) => void;
}

export default function ChatComposer({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  models,
  currentModel,
  onSelectModel,
}: ChatComposerProps) {
  const [input, setInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const selectedModelObj = models.find(m => m.id === currentModel) || models[0];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-6 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative bg-white border border-neutral-300/80 rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-neutral-900 focus-within:border-transparent transition-all">

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Continue this session or ask anything..."
            rows={1}
            className="w-full resize-none bg-transparent pt-4 pb-2 px-4 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none max-h-48"
          />

          {/* Bottom Toolbar inside Composer */}
          <div className="flex items-center justify-between px-3 pb-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              {/* Attachment Button */}
              <button
                type="button"
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                title="Attach file or image"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Model Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[160px]">{selectedModelObj?.name || 'Ela GPT v4 Turbo'}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </button>

                {showModelDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-2xl py-1.5 z-50">
                    <div className="px-3.5 py-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                      Available AI Models
                    </div>
                    {models.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelectModel(m.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-neutral-50 flex flex-col transition-colors ${m.id === currentModel ? 'bg-neutral-100 font-semibold' : ''}`}
                      >
                        <div className="flex items-center justify-between text-neutral-900">
                          <span>{m.name}</span>
                          <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-md">{m.provider}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 truncate mt-0.5">{m.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Send / Stop Button */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[11px] text-neutral-400">
                Shift + Return for new line
              </span>

              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-sm flex items-center justify-center"
                  title="Stop generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 transition-all shadow-sm flex items-center justify-center"
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="text-center mt-3">
          <p className="text-[11px] text-neutral-400">
            Ela GPT Platform — Fully functional demo with modular AI provider architecture.
          </p>
        </div>
      </div>
    </div>
  );
}
