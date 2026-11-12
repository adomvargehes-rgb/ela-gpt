import React from 'react';
import { Message } from '@/types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export default function MessageList({ messages, onRegenerate, isGenerating }: MessageListProps) {
  return (
    <div className="divide-y divide-neutral-100">
      {messages.map((msg, index) => (
        <MessageItem
          key={msg.id || index}
          message={msg}
          onRegenerate={index === messages.length - 1 && msg.role === 'assistant' ? onRegenerate : undefined}
          isGenerating={isGenerating}
        />
      ))}
    </div>
  );
}
