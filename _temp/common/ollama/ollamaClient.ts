import {Ollama} from 'ollama';
import {getEnvVariable} from '../../../src/common/getEnvVariable';

const host = getEnvVariable('OLLAMA_API_URL');

export const ollamaModel = getEnvVariable('OLLAMA_MODEL');
export const ollama = new Ollama({
  host,
});
