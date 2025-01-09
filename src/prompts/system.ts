import {SystemMessagePromptTemplate} from '@langchain/core/prompts';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const prompt = readFileSync(
  join(__dirname, '../../src/prompts/system.prompt'),
  'utf8',
);

export const systemPromptTemplate: SystemMessagePromptTemplate =
  SystemMessagePromptTemplate.fromTemplate(prompt);
