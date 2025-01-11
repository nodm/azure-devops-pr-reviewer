import {ChatAnthropic} from '@langchain/anthropic';
import {getEnvVariable} from '../common';

const model = getEnvVariable('ANTHROPIC_MODEL');
const temperature = parseFloat(getEnvVariable('TEMPERATURE', '0'));

export const llm = new ChatAnthropic({
  model,
  temperature,
  maxTokens: undefined,
  maxRetries: 2,
});
