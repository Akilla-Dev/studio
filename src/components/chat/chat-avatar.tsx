import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Terminal } from 'lucide-react';

interface ChatAvatarProps {
  role: Message['role'];
}

export default function ChatAvatar({ role }: ChatAvatarProps) {
  const getAvatar = () => {
    switch (role) {
      case 'user':
        return (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        );
      case 'assistant':
        return (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent text-accent-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        );
      case 'system':
        return (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-muted-foreground">
              <Terminal className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        );
      default:
        return null;
    }
  };

  return getAvatar();
}
