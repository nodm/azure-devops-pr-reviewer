import {select} from '@inquirer/prompts';
import {tool} from '@langchain/core/tools';
import {z} from 'zod';

const schema = z.object({
  message: z.string().describe('The message to display to the user'),
  choices: z
    .object({
      value: z
        .string()
        .describe('The value is what will be returned by the tool'),
      name: z.string().describe('The string displayed in the choice list'),
    })
    .array()
    .describe('The list of options to choose from'),
});

export const optionSelectorTool = tool(optionSelector, {
  name: 'optionSelector',
  description:
    'Provide the user with a list of options to choose from, wait for their input, and return the selected option',
  schema,
});

async function optionSelector({message, choices}: z.infer<typeof schema>) {
  const selectedOption = await select({message, choices});

  return `
The selected option is: ${selectedOption}
`;
}
