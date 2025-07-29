'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';

const formSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSmartTool: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    onSendMessage(values.message);
    form.reset();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.handleSubmit(onSubmit)();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Ask the agent anything..."
                  className="pr-16 min-h-[52px] resize-none neon-glow"
                  {...field}
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center">
            <Button type="submit" size="icon" disabled={isLoading} className="bg-primary text-primary-foreground">
                <SendHorizontal className="h-5 w-5" />
                <span className="sr-only">Send Message</span>
            </Button>
        </div>
      </form>
    </Form>
  );
}
