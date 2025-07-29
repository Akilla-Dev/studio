import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;

  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center my-2">
        <div className="text-xs text-muted-foreground max-w-2xl w-full px-2">
            {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex my-2 text-sm', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'p-3 rounded-lg max-w-xl',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {content}
      </div>
    </div>
  );
}
