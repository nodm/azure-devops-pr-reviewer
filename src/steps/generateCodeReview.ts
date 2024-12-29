import type {IGitApi} from 'azure-devops-node-api/GitApi';
import type {GitPullRequest} from 'azure-devops-node-api/interfaces/GitInterfaces';
import type {Message} from 'ollama';
import {ollama, ollamaModel as model, getPullRequestChanges} from '../common';
import {
  // getFileListFromPullRequestTool,
  // getFileListFromPullRequestHandler,
  getPullRequestDetailsTool,
  getPullRequestDetailsHandler,
  getPullRequestFileContentTool,
  getPullRequestFileContentHandler,
} from '../common/ollama/tools';

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
      - Jest,
      - REact Testing Library,
      - WEB standards,
      - WEB security,
      - software design patterns.`,
};

export async function generateCodeReview(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  const changes = await getPullRequestChanges(gitApi, pullRequest);
  const files = changes
    .filter(change => Boolean(change.item))
    .map(change => change.item!.path)
    .filter(path => Boolean(path));

  const userMessage: Message = {
    role: 'user',
    content: `
Provide a comprehensive code review for the pull request with ID=${pullRequest.pullRequestId} with a structured feedback on:
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

Here is the list of files included in the pull request:
${files.map(file => `- ${file}`).join('\n')}
`,
  };
  const messages: Message[] = [systemMessage, userMessage];
  const availableFunctions = {
    // ...getFileListFromPullRequestHandler(gitApi, pullRequest),
    ...getPullRequestDetailsHandler(gitApi, pullRequest),
    ...getPullRequestFileContentHandler(gitApi, pullRequest),
  };

  let isCompleted = false;
  while (!isCompleted) {
    const response = await ollama.chat({
      model,
      messages,
      tools: [getPullRequestDetailsTool, getPullRequestFileContentTool],
      // stream: true,
      options: {
        temperature: 0.1,
        top_p: 0.7,
        // num_ctx: ctx,
      },
    });

    let output: string;
    if (response.message.tool_calls) {
      // Process tool calls from the response
      for (const tool of response.message.tool_calls) {
        const functionToCall = availableFunctions[tool.function.name];
        if (functionToCall) {
          console.log('Calling function:', tool.function.name);
          console.log('Arguments:', tool.function.arguments);
          output = await functionToCall(
            tool.function.arguments as {
              file: string;
            },
          );
          console.log('Function output:', output);

          // Add the function response to messages for the model to use
          messages.push(response.message);
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
      messages.push(response.message);
      console.log('No tool calls returned from model');
    }
  }
  console.log('>'.repeat(80));
  console.log(JSON.stringify(messages, null, 2));
}
