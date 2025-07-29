'use server';

import { smartToolInvocation } from '@/ai/flows/smart-tool-invocation';
import type { Message } from '@/lib/types';
import type { SmartToolInvocationOutput } from '@/ai/flows/smart-tool-invocation';


const WEBHOOK_URL = 'https://n8n-agentai-pqrsandmore-u43659.vm.elestio.app/webhook/input';

interface N8NResponse {
  reply?: string;
  text?: string;
  response?: string;
}

export async function sendMessageToWebhook(prompt: string): Promise<string> {
  if (!prompt) {
    return "I can't send an empty message.";
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Webhook responded with status ${response.status}: ${errorBody}`);
      return `Sorry, the agent returned an error (status ${response.status}).`;
    }

    const data: N8NResponse | N8NResponse[] = await response.json();
    
    let replyText = '';

    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      replyText = firstItem.reply || firstItem.text || firstItem.response || JSON.stringify(firstItem);
    } else if (!Array.isArray(data)) {
      replyText = data.reply || data.text || data.response || JSON.stringify(data);
    }

    if (!replyText || replyText === '{}' || replyText === '[]') {
      return "I received an empty or invalid response from the agent.";
    }

    return replyText;
  } catch (error) {
    console.error('Error calling webhook:', error);
    return 'Sorry, I encountered an error trying to connect to the agent.';
  }
}

export async function invokeSmartToolAction(chatHistory: Message[]): Promise<SmartToolInvocationOutput> {
  const formattedHistory = chatHistory
    .map((msg) => `${msg.role}: ${typeof msg.content === 'string' ? msg.content : '[Object Message]'}`)
    .join('\n');

  const availableTools = ['get_weather', 'search_knowledge_base', 'create_ticket'];

  try {
    const result = await smartToolInvocation({
      chatHistory: formattedHistory,
      availableTools,
    });
    return result;
  } catch (error) {
    console.error('Error invoking smart tool:', error);
    return {
      reasoning: 'An error occurred while trying to invoke the smart tool.',
    };
  }
}
