export async function getLLM(llmProvider: string) {
  switch (llmProvider) {
    case 'anthropic':
      return import('./anthropic').then(module => module.llm);
    case 'ollama':
      return import('./ollama').then(module => module.llm);
    case 'openai':
      return import('./openai').then(module => module.llm);
    default:
      throw new Error(`No LLM provider found for ${llmProvider}`);
  }
}
