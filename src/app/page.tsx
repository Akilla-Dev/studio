'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
import { invokeSmartToolAction, sendMessageToWebhook } from '@/app/actions';
import ChatMessages from '@/components/chat/chat-messages';
import ChatInput from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
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

  const handleSmartTool = async () => {
    setIsLoading(true);
    const result = await invokeSmartToolAction(messages);
    
    const resultMessageContent = (
      <Card className="my-2 bg-secondary/50 border-accent">
        <CardHeader>
          <CardTitle className="text-base font-headline">Smart Tool Invocation</CardTitle>
          <CardDescription>The AI analyzed the conversation to see if a tool could help.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
            <p><strong className="font-medium">Reasoning:</strong> {result.reasoning}</p>
            {result.toolToUse ? (
                <div>
                    <p><strong className="font-medium">Tool:</strong> <code className="font-mono bg-muted p-1 rounded">{result.toolToUse}</code></p>
                    <p><strong className="font-medium">Parameters:</strong></p>
                    <pre className="bg-muted p-2 rounded-md text-xs font-code">
                        <code>{JSON.stringify(result.parameters, null, 2)}</code>
                    </pre>
                </div>
            ) : <p><strong className="font-medium">Action:</strong> No tool was recommended at this time.</p>}
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

  const handleClearConversation = () => {
    setMessages([]);
    toast({
        title: "Conversation Cleared",
        description: "You can start a new chat now.",
    })
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <h1 className="text-xl font-bold font-headline text-primary">AgentAI Chat</h1>
        <Button variant="ghost" size="icon" onClick={handleClearConversation} aria-label="Clear Conversation">
          <Trash2 className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
            <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
      </main>
      <footer className="p-4 border-t bg-card">
        <div className="max-w-3xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              onSmartTool={handleSmartTool}
              isLoading={isLoading}
            />
        </div>
      </footer>
    </div>
  );
}
