import type {Message} from 'ollama';
import {ollama, ollamaModel as model} from '../common';

const messages: Message[] = [
  {
    role: 'system',
    content: `
    You are a helpful coding assistant who specializes in code reviews.
    You are proficient in:
      - JavaScript,
      - TypeScript,
      - React,
      - Redux,
      - Redux Toolkit,
      - Redux Toolkit Query,
      - MUI UI,
      - WEB standards,
      - WEB security,
      - software design patterns.`,
  },
];

export async function getCodeReview(files: {path?: string; content: string}[]) {
  const message = {
    role: 'user',
    content: `
Review the following pull request.
Each file is provided in this structure:
  <file>
    <path>path to a file</path>
    <content>file content</content>
  </file>

Review steps for each file:

  Analyze the code for:
    - Potential bugs
    - Security vulnerabilities
    - Performance issues
    - Code style and consistency
    - Design pattern usage
    - Component reusability
    - State management approaches
    - Side effects handling
    - Error handling
    - Type safety

  Consider:
    - Does the code follow SOLID principles?
    - Is there proper error handling?
    - Are there potential memory leaks?
    - Is the code DRY (Don't Repeat Yourself)?
    - Are variable/function names clear and meaningful?
    - Is the code properly documented where necessary?
    - Are there any missing tests?
    - Could the solution be simplified?

  Provide feedback in this format for each file:
    - Summary of changes
    - Critical issues (if any)
    - Potential improvements
    - Positive aspects
    - Specific recommendations with code examples when relevant

  Finally, provide:
    - Overall assessment
    - Key recommendations
    - Major concerns (if any)
    - Suggested next steps
  
The files are:

${files
  .map(
    file => `
<file>
  <path>${file.path}</path>
  <content>${file.content}</content>
</file>`,
  )
  .join('\n\n')}
    `,
  };
  messages.push(message);

  let codeReview = '';
  const response = await ollama.chat({
    model,
    messages,
    stream: true,
  });
  for await (const part of response) {
    process.stdout.write(part.message.content);
    codeReview += part.message.content;
  }

  return codeReview;
}
