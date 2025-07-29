'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
// import { invokeSmartToolAction, sendMessageToWebhook } from '@/app/actions'; // invokeSmartToolAction removed
import { sendMessageToWebhook } from '@/app/actions';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
/*
  const handleSmartTool = async () => {
    setIsLoading(true);
    const result = await invokeSmartToolAction(messages);
    
    const resultMessageContent = (
      <Card className="my-2 bg-secondary/50 border-accent text-sm neon-glow">
        <CardContent className="p-3">
            <p><strong className="font-medium neon-text-gradient">Tool:</strong> {result.toolToUse ? <code className="font-mono bg-muted p-1 rounded">{result.toolToUse}</code> : 'None'}</p>
        </CardContent>
      </Card>
    );

    const systemMessage: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        content: resultMessageContent,
        createdAt: new Date(),
    }
    
    setMessages((prevMessages) => [...prevMessages, systemMessage]);
    setIsLoading(false);
  };
*/
  const handleClearConversation = () => {
    setMessages([]);
    toast({
        title: "Conversation Cleared",
        description: "You can start a new chat now.",
    })
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
            {messages.length > 0 && (
                <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="icon" onClick={handleClearConversation} aria-label="Clear Conversation" className="neon-glow">
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            )}
            <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
      </main>
      <footer className="p-4 border-t bg-card neon-glow">
        <div className="max-w-3xl mx-auto">
            <ChatInput
            onSendMessage={handleSendMessage}
            // onSmartTool={handleSmartTool}
            isLoading={isLoading} onSmartTool={function (): void {
              throw new Error('Function not implemented.');
            } }            />
        </div>
      </footer>
    </div>
  );
}
