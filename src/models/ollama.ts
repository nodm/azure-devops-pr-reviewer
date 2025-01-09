import {ChatOpenAI} from '@langchain/openai';
import {getEnvVariable} from '../common';

const baseURL = getEnvVariable('OLLAMA_API_URL');
const model = getEnvVariable('OLLAMA_MODEL');
const temperature = parseFloat(getEnvVariable('OLLAMA_TEMPERATURE'));

export const llm = new ChatOpenAI({
  configuration: {
    baseURL,
  },
  model,
  temperature,
  apiKey: 'ollama', // required but unused

  /**
   * Maximum number of tokens to generate in the completion. -1 returns as many
   * tokens as possible given the prompt and the model's maximum context size.
   */
  // maxTokens?: number;

  /** Total probability mass of tokens to consider at each step */
  // topP: number;

  /** Number of completions to generate for each prompt */
  // n: number;

  /** Whether to stream the results or not. Enabling disables tokenUsage reporting */
  // streaming: boolean;
});
