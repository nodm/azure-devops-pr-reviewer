import {readFileSync} from 'node:fs';
import {join} from 'node:path';

export function createPrompt(
  name: string,
  variables: Record<string, string> = {},
) {
  const promptTemplate = readFileSync(
    join(__dirname, `../../src/prompts/${name}.prompt`),
    'utf8',
  );
  const prompt = promptTemplate.replace(
    /\${(.*?)}/g,
    (match, variableName) => variables[variableName] || match,
  );

  return prompt;
}
