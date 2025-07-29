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
            <Bot className="h-16 w-16 mb-4 text-primary/50" />
            <h2 className="text-2xl font-headline font-semibold">Welcome to AgentAI Chat</h2>
            <p className="mt-2">Ask me anything! I'm connected to an n8n agent.</p>
        </div>
      )}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <ChatMessage message={{id: 'loading', role: 'assistant', content: '... thinking'}} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
