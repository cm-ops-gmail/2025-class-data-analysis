'use server';

/**
 * @fileOverview Summarizes class feedback to provide a quick understanding of general sentiment and key points.
 *
 * - summarizeClassFeedback - A function that summarizes class feedback.
 * - SummarizeClassFeedbackInput - The input type for the summarizeClassFeedback function.
 * - SummarizeClassFeedbackOutput - The return type for the summarizeClassFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClassFeedbackInputSchema = z.object({
  feedback: z.string().describe('The feedback text to summarize.'),
});
export type SummarizeClassFeedbackInput = z.infer<typeof SummarizeClassFeedbackInputSchema>;

const SummarizeClassFeedbackOutputSchema = z.object({
  summary: z.string().describe('The summary of the class feedback.'),
});
export type SummarizeClassFeedbackOutput = z.infer<typeof SummarizeClassFeedbackOutputSchema>;

export async function summarizeClassFeedback(input: SummarizeClassFeedbackInput): Promise<SummarizeClassFeedbackOutput> {
  return summarizeClassFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClassFeedbackPrompt',
  input: {schema: SummarizeClassFeedbackInputSchema},
  output: {schema: SummarizeClassFeedbackOutputSchema},
  prompt: `Summarize the following class feedback. Provide a concise summary of the key points and overall sentiment:\n\nFeedback: {{{feedback}}}`,
});

const summarizeClassFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeClassFeedbackFlow',
    inputSchema: SummarizeClassFeedbackInputSchema,
    outputSchema: SummarizeClassFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
