'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Wand2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSmartTool: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, onSmartTool, isLoading }: ChatInputProps) {
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
                  className="pr-24 min-h-[52px] resize-none"
                  {...field}
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" onClick={onSmartTool} disabled={isLoading}>
                            <Wand2 className="h-5 w-5" />
                            <span className="sr-only">Smart Tool Invocation</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Invoke Smart Tool (AI decides)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Button type="submit" size="icon" disabled={isLoading}>
                <SendHorizontal className="h-5 w-5" />
                <span className="sr-only">Send Message</span>
            </Button>
        </div>
      </form>
    </Form>
  );
}
