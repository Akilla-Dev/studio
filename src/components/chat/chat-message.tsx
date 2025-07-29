import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import ChatAvatar from './chat-avatar';
import { Card, CardContent } from '../ui/card';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;

  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center my-4">
        <div className="text-xs text-muted-foreground max-w-2xl w-full">
            {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-start gap-3 my-4', isUser && 'justify-end')}
    >
      {!isUser && <ChatAvatar role={role} />}
      <Card
        className={cn(
          'max-w-xl rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        <CardContent className="p-3 text-sm">{content}</CardContent>
      </Card>
      {isUser && <ChatAvatar role={role} />}
    </div>
  );
}
