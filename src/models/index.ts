import {llm as ollama} from './ollama';
import {llm as openai} from './openai';

const llmProviders = new Map([
  ['ollama', ollama],
  ['openai', openai],
]);

export function getLLM(llmProvider: string) {
  const llm = llmProviders.get(llmProvider);

  if (!llm) {
    throw new Error(`No LLM provider found for ${llmProvider}`);
  }

  return llm;
}
