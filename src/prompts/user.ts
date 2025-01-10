import {HumanMessagePromptTemplate} from '@langchain/core/prompts';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const prompt = readFileSync(
  join(__dirname, '../../src/prompts/user.prompt'),
  'utf8',
);

export const userPromptTemplate: HumanMessagePromptTemplate =
  HumanMessagePromptTemplate.fromTemplate(prompt);
