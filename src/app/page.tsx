'use client';

import { useState, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { sendMessageToWebhook } from '@/app/actions';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


const Particle = ({ style }: { style: React.CSSProperties }) => {
    return <div className="particle" style={style}></div>;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<React.ReactElement[]>([]);
  const { toast } = useToast();


  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 25}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            '--particle-x-end': `${Math.random() * 200 - 100}px`,
        } as React.CSSProperties;
        return <Particle key={i} style={style} />;
    });
    setParticles(newParticles);
  }, []);


  const handleSendMessage = async (prompt: string) => {
    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      createdAt: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const responseContent = await sendMessageToWebhook(prompt);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: responseContent,
      createdAt: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setIsLoading(false);
  };

  const handleClearConversation = () => {
    setMessages([]);
    toast({
        title: "Conversation Cleared",
        description: "You can start a new chat now.",
    })
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-gradient-to-br from-primary/10 via-secondary/20 to-background bg-200%">
        <div className="particle-background">{particles}</div>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
        <div className="max-w-3xl mx-auto">
            {messages.length > 0 && (
                <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="icon" onClick={handleClearConversation} aria-label="Clear Conversation">
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            )}
            <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
      </main>
      <footer className="p-4 border-t bg-card z-10">
        <div className="max-w-3xl mx-auto">
            <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading} onSmartTool={function (): void {
              throw new Error('Function not implemented.');
            } }            />
        </div>
      </footer>
    </div>
  );
}