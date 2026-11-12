import React, { useState } from 'react';
import { Message } from '@/types';
import { Copy, Check, Sparkles, User, RefreshCw } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export default function MessageItem({ message, onRegenerate, isGenerating }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Formatter for markdown and code blocks
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-z0-9_-]+/i) ? lines[0] : '';
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-neutral-200 bg-[#1e1e1e] text-neutral-100 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-neutral-700 text-neutral-400">
              <span className="uppercase text-[10px] font-semibold">{lang || 'code'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre-wrap">{code}</pre>
          </div>
        );
      }

      return (
        <p key={index} className="whitespace-pre-wrap leading-relaxed mb-2 last:mb-0">
          {part.split('\n').map((line, lineIdx) => {
            if (line.startsWith('### ')) {
              return <h3 key={lineIdx} className="font-semibold text-base mt-3 mb-1 text-neutral-900">{renderInlineMarkdown(line.replace('### ', ''))}</h3>;
            }
            if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
              return <li key={lineIdx} className="ml-4 list-disc text-neutral-800">{renderInlineMarkdown(line.replace(/^(- |\d+\.\s)/, ''))}</li>;
            }
            return <span key={lineIdx}>{renderInlineMarkdown(line)}<br /></span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`py-5 px-4 md:px-8 flex gap-4 ${isUser ? 'bg-white' : 'bg-[#fcfcfc] border-y border-neutral-100'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isUser ? 'bg-neutral-900 text-white' : 'bg-emerald-600 text-white shadow-sm'}`}>
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-emerald-100" />}
      </div>

      <div className="flex-1 space-y-1.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-neutral-900">
            {isUser ? 'You' : 'Ela GPT'}
          </span>
          <span className="text-[10px] text-neutral-400">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="text-sm text-neutral-800 font-normal">
          {renderFormattedContent(message.content)}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 pt-2 text-neutral-400">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] hover:text-neutral-700 transition-colors p-1 rounded hover:bg-neutral-100"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-1 text-[11px] hover:text-neutral-700 transition-colors p-1 rounded hover:bg-neutral-100 disabled:opacity-50"
                title="Regenerate response"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
