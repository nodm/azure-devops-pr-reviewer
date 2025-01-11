import {llm as anthropic} from './anthropic';
import {llm as ollama} from './ollama';
import {llm as openai} from './openai';

export function getLLM(llmProvider: string) {
  switch (llmProvider) {
    case 'anthropic':
      return anthropic;
    case 'ollama':
      return ollama;
    case 'openai':
      return openai;
    default:
      throw new Error(`No LLM provider found for ${llmProvider}`);
  }
}
