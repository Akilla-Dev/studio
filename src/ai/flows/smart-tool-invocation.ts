'use server';

/**
 * @fileOverview A flow that uses an LLM to analyze the chat history and determine if any available tools are relevant to the conversation.
 *
 * - smartToolInvocation - A function that handles the smart tool invocation process.
 * - SmartToolInvocationInput - The input type for the smartToolInvocation function.
 * - SmartToolInvocationOutput - The return type for the smartToolInvocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartToolInvocationInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The complete chat history between the user and the agent.'),
  availableTools: z
    .array(z.string())
    .describe('The names of the available tools.'),
});
export type SmartToolInvocationInput = z.infer<typeof SmartToolInvocationInputSchema>;

const SmartToolInvocationOutputSchema = z.object({
  toolToUse: z
    .string()
    .optional()
    .describe('The name of the tool to use, if any.'),
  parameters: z.record(z.any()).optional().describe('The parameters to use for the tool, if any.'),
  reasoning: z.string().describe('The reasoning behind the tool invocation decision.'),
});
export type SmartToolInvocationOutput = z.infer<typeof SmartToolInvocationOutputSchema>;

export async function smartToolInvocation(input: SmartToolInvocationInput): Promise<SmartToolInvocationOutput> {
  return smartToolInvocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartToolInvocationPrompt',
  input: {schema: SmartToolInvocationInputSchema},
  output: {schema: SmartToolInvocationOutputSchema},
  prompt: `You are an expert system designed to analyze chat histories and determine if any tools should be used to enhance the agent's response.

  You have access to the following tools: {{availableTools}}

  Analyze the following chat history:
  {{chatHistory}}

  Based on the chat history, determine if any of the available tools are relevant to the conversation. If a tool is relevant, determine the appropriate parameters to use for the tool.

  Return the name of the tool to use in the toolToUse field. If no tool is relevant, leave the toolToUse field empty.

  Return the parameters to use for the tool in the parameters field. If no tool is relevant, leave the parameters field empty.

  Include your reasoning for the tool invocation decision in the reasoning field.

  Ensure that the parameters you pass are compatible with the tool.
  `,
});

const smartToolInvocationFlow = ai.defineFlow(
  {
    name: 'smartToolInvocationFlow',
    inputSchema: SmartToolInvocationInputSchema,
    outputSchema: SmartToolInvocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
