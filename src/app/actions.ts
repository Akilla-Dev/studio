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

  console.log(`Sending prompt to webhook: "${prompt}"`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt }),
    });

    const responseBody = await response.text();
    console.log('Webhook response status:', response.status);
    console.log('Webhook response body:', responseBody);

    if (!response.ok) {
      console.error(`Webhook responded with status ${response.status}: ${responseBody}`);
      return `Sorry, the agent returned an error (status ${response.status}). Check the server logs for details.`;
    }

    try {
      const jsonResponse: N8NResponse = JSON.parse(responseBody);
      const reply = jsonResponse.reply || jsonResponse.text || jsonResponse.response;
      if (reply) {
        console.log('Extracted reply from JSON:', reply);
        return reply;
      } else {
        console.warn('JSON response did not contain a recognized reply field (reply, text, or response).');
        return responseBody;
      }
    } catch (e) {
      console.log('Response was not JSON, returning raw text.');
      return responseBody;
    }
  } catch (error) {
    console.error('Failed to send message to webhook:', error);
    return 'Sorry, there was an issue connecting to the agent.';
  }
}

/*
* This function is temporarily commented out to resolve a build issue.
* We will fix and re-enable it after confirming the webhook functionality.
export async function invokeSmartToolAction(
  messages: Message[]
): Promise<SmartToolInvocationOutput> {
  const result = await smartToolInvocation({
    chatHistory: messages.map((m) => `${m.role}: ${m.content}`).join('
'),
    availableTools: ['sendEmail', 'searchWeb'], // ToDo: Make this dynamic
  });
  return result;
}
*/
