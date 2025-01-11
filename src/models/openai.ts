import {ChatOpenAI} from '@langchain/openai';
import {getEnvVariable} from '../common';

const model = getEnvVariable('OPEN_AI_MODEL');
const temperature = parseFloat(getEnvVariable('TEMPERATURE', '0'));

export const llm = new ChatOpenAI({
  model,
  temperature,

  /**
   * Maximum number of tokens to generate in the completion. -1 returns as many
   * tokens as possible given the prompt and the model's maximum context size.
   */
  maxTokens: -1,

  /** Total probability mass of tokens to consider at each step */
  // topP: number;

  /** Number of completions to generate for each prompt */
  // n: number;

  /** Whether to stream the results or not. Enabling disables tokenUsage reporting */
  // streaming: boolean;
});
