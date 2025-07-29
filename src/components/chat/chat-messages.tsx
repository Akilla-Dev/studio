'use client';

import type { Message } from '@/lib/types';
import { useEffect, useRef } from 'react';
import ChatMessage from './chat-message';
import { Bot } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-2 text-primary/50 neon-glow" />
            <h2 className="text-xl font-headline font-semibold neon-text-gradient">AgentAI</h2>
            <p className="text-sm neon-text-gradient">Ask me anything!</p>
        </div>
      )}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <ChatMessage message={{id: 'loading', role: 'assistant', content: '...'}} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
