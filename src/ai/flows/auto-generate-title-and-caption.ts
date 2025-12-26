'use server';
/**
 * @fileOverview A flow for automatically generating social media titles and captions from class data.
 *
 * - autoGenerateTitleAndCaption - A function that generates title and caption.
 * - AutoGenerateTitleAndCaptionInput - The input type for the autoGenerateTitleAndCaption function.
 * - AutoGenerateTitleAndCaptionOutput - The return type for the autoGenerateTitleAndCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoGenerateTitleAndCaptionInputSchema = z.object({
  date: z.string().describe('The date of the class.'),
  scheduledTime: z.string().describe('The scheduled time of the class.'),
  productType: z.string().describe('The product type of the class.'),
  course: z.string().describe('The course name.'),
  subject: z.string().describe('The subject of the class.'),
  topic: z.string().describe('The topic of the class.'),
  teacher1: z.string().describe('The name of the primary teacher.'),
});
export type AutoGenerateTitleAndCaptionInput = z.infer<typeof AutoGenerateTitleAndCaptionInputSchema>;

const AutoGenerateTitleAndCaptionOutputSchema = z.object({
  title: z.string().describe('The generated title for the social media post.'),
  caption: z.string().describe('The generated caption for the social media post.'),
});
export type AutoGenerateTitleAndCaptionOutput = z.infer<typeof AutoGenerateTitleAndCaptionOutputSchema>;

export async function autoGenerateTitleAndCaption(
  input: AutoGenerateTitleAndCaptionInput
): Promise<AutoGenerateTitleAndCaptionOutput> {
  return autoGenerateTitleAndCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoGenerateTitleAndCaptionPrompt',
  input: {schema: AutoGenerateTitleAndCaptionInputSchema},
  output: {schema: AutoGenerateTitleAndCaptionOutputSchema},
  prompt: `You are an expert social media content creator.
  Generate an engaging title and caption for a social media post promoting a class.
  Use the provided information about the class to create compelling content.

  Date: {{{date}}}
  Scheduled Time: {{{scheduledTime}}}
  Product Type: {{{productType}}}
  Course: {{{course}}}
  Subject: {{{subject}}}
  Topic: {{{topic}}}
  Teacher: {{{teacher1}}}

  Title:
  Caption:`,
});

const autoGenerateTitleAndCaptionFlow = ai.defineFlow(
  {
    name: 'autoGenerateTitleAndCaptionFlow',
    inputSchema: AutoGenerateTitleAndCaptionInputSchema,
    outputSchema: AutoGenerateTitleAndCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
