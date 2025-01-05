import type {Message} from 'ollama';
import {ollama, ollamaModel as model} from '../common';
import {
  // addCommentToPullRequestHandler,
  // addCommentToPullRequestTool,
  getPullRequestDetailsHandler,
  getPullRequestDetailsTool,
  getPullRequestFileContentHandler,
  getPullRequestListHandler,
  getPullRequestFileContentTool,
  getPullRequestListTool,
  getRepositoryListHandler,
  getRepositoryListTool,
} from '../common/ollama/tools';

const systemMessage: Message = {
  role: 'system',
  content: `
    You are a helpful coding assistant who specializes in code reviews.

    You are proficient in:
      - HTML,
      - CSS,
      - JavaScript,
      - TypeScript,
      - React,
      - Redux,
      - Redux Toolkit,
      - Redux Toolkit Query,
      - MUI UI,
      - Jest,
      - REact Testing Library,
      - WEB standards,
      - WEB security,
      - software design patterns.

    Azure DevOpes is used for version control and CI/CD.
    You can retrieve information about repositories, pull requests and files in the repository.`,
};

export async function generateCodeReview() {
  const userMessage: Message = {
    role: 'user',
    content: `
Provide a comprehensive code review for a pull request with a structured feedback on:
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
Mention only things that can/should be improved and avoid making subjective judgments.
You don't need to mention a point that that does not need improvement.

Feel free to ask for more information if needed.`,
  };
  const messages: Message[] = [systemMessage, userMessage];

  const tools = [
    // addCommentToPullRequestTool,
    getPullRequestDetailsTool,
    getPullRequestFileContentTool,
    getPullRequestListTool,
    getRepositoryListTool,
  ];
  const availableFunctions = {
    ...getPullRequestDetailsHandler(),
    ...getPullRequestFileContentHandler(),
    ...getPullRequestListHandler(),
    ...getRepositoryListHandler(),
  };

  let isCompleted = false;
  while (!isCompleted) {
    const response = await ollama.chat({
      model,
      messages,
      tools,
      // stream: true,
      options: {
        temperature: 0.1,
        top_p: 0.7,
        // num_ctx: ctx,
      },
    });

    messages.push(response.message);

    let output: string;
    if (response.message.tool_calls) {
      // Process tool calls from the response
      for (const tool of response.message.tool_calls) {
        const functionToCall = availableFunctions[tool.function.name];
        if (functionToCall) {
          console.log('Calling function:', tool.function.name);
          console.log('Arguments:', tool.function.arguments);
          const args = {
            repositoryId: tool.function.arguments.repositoryId || '',
            pullRequestId: tool.function.arguments.pullRequestId || 0,
            file: tool.function.arguments.file || '',
            project: tool.function.arguments.project || '',
            ...tool.function.arguments,
          };
          output = await functionToCall(args);
          console.log('Function output:', output);

          // Add the function response to messages for the model to use
          messages.push({
            role: 'tool',
            content: output.toString(),
          });
        } else {
          messages.push(response.message);
          console.log('Function', tool.function.name, 'not found');
        }
      }
    } else {
      isCompleted = true;
    }
  }
  console.log('>'.repeat(80));
  console.log(JSON.stringify(messages, null, 2));
}
