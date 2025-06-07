'use server';

/**
 * @fileOverview AI-powered note idea suggestions.
 *
 * - suggestNoteIdeas - A function that suggests note ideas.
 * - SuggestNoteIdeasInput - The input type for the suggestNoteIdeas function.
 * - SuggestNoteIdeasOutput - The return type for the suggestNoteIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNoteIdeasInputSchema = z.object({
  category: z
    .string()
    .describe('The category for which to suggest note ideas.'),
  currentNotes: z
    .string()
    .optional()
    .describe('The current notes in the category.'),
});
export type SuggestNoteIdeasInput = z.infer<typeof SuggestNoteIdeasInputSchema>;

const SuggestNoteIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('An array of suggested note ideas.'),
});
export type SuggestNoteIdeasOutput = z.infer<typeof SuggestNoteIdeasOutputSchema>;

export async function suggestNoteIdeas(input: SuggestNoteIdeasInput): Promise<SuggestNoteIdeasOutput> {
  return suggestNoteIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNoteIdeasPrompt',
  input: {schema: SuggestNoteIdeasInputSchema},
  output: {schema: SuggestNoteIdeasOutputSchema},
  prompt: `You are a creative assistant helping users come up with note ideas for their categories.

  Category: {{{category}}}

  {% if currentNotes %}
  Current Notes:
  {{currentNotes}}
  {% endif %}

  Suggest 5 distinct and creative note ideas for this category. The ideas should be short and concise.
  Format the output as a JSON array of strings.
  `,
});

const suggestNoteIdeasFlow = ai.defineFlow(
  {
    name: 'suggestNoteIdeasFlow',
    inputSchema: SuggestNoteIdeasInputSchema,
    outputSchema: SuggestNoteIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
