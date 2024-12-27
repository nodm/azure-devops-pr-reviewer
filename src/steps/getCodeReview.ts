import type {Message} from 'ollama';
import {ollama, ollamaModel as model} from '../common';

const systemMessage: Message = {
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
};

export async function getCodeReview(
  files: Array<{path?: string; content: string}>,
) {
  const groupedFiles = files.reduce(
    (
      acc: {[key: string]: {path?: string; content: string}[]},
      {path = '', content},
    ) => {
      const key = getKey(path);
      console.log(key);
      return {
        ...acc,
        [key]: acc[key] ? [...acc[key], {path, content}] : [{path, content}],
      };
    },
    {},
  );
  const sortedGroupedFiles = Object.entries(groupedFiles)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, files]) => files);

  const codeReview = [`**Model:** _${model}_\n\n`];

  for (const files of sortedGroupedFiles) {
    const userMessage = createMessage(files);
    const messages = [systemMessage, userMessage];
    const ctx = getContextWindowSize(messages);
    const response = await ollama.chat({
      model,
      messages,
      stream: true,
      options: {
        temperature: 0.1,
        top_p: 0.7,
        num_ctx: ctx,
      },
    });
    let review = '';
    for await (const part of response) {
      process.stdout.write(part.message.content);
      review += part.message.content;
    }
    codeReview.push(review);
  }

  return codeReview.join('<hr />');
}

function getKey(path = '') {
  const ext = path.match(/\.[^/.]+$/);

  if (!ext) return path;

  return path.endsWith('.test' + ext[0])
    ? path.slice(0, -('.test' + ext[0]).length)
    : path.slice(0, -ext[0].length);
}

function createMessage(
  files: Array<{path?: string; content: string}>,
): Message {
  const message = {
    role: 'user',
    content: `
Provide a comprehensive code review with a structured feedback on:
  1. code quality and best practices,
  2. performance optimizations,
  3. security vulnerabilities,
  4. readability and maintainability,
  5. adherence to coding standards and conventions,
  6. use of appropriate libraries and frameworks,
  7. code duplication and refactoring suggestions,
  8. error handling and exception management,
  9. design patterns and code structure suggestions,
  10. overall code organization and structure,
  11. testing and debugging advice.

Provide specific examples and actionable steps for improvement.
Mention only things that can/should be improved and avoid making subjective judgments. You don't need to mention a point that that does not need improvement.
Provide code review for every file.

Each file is provided in this structure:
  <file>
    <path>path to a file</path>
    <content>file content</content>
  </file>

Here's the list of files for review:

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

  return message;
}

function getContextWindowSize(messages: Message[]) {
  return (
    Math.ceil(
      messages.reduce((acc, {content}) => acc + content.length, 0) /
        0.8 /
        1_000,
    ) * 1_000
  );
}
