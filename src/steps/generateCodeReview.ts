import type {Message} from 'ollama';
import {ollama, ollamaModel as model, getEnvVariable} from '../common';
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

const projectName = getEnvVariable('AZURE_DEVOPS_PROJECT_NAME');
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
  - React Testing Library,
  - WEB standards,
  - WEB security,
  - software design patterns.

Azure DevOpes is used for version control and CI/CD.
The current project is "${projectName}"
You can retrieve information about repositories, pull requests, and files in the repository.
If multiple repositories are available, please provide a list for me to choose from. I will select one by entering its number, and you can wait for my input before proceeding.
The same approach applies to pull requests within the selected repository.

Provide the information in a user-friendly way.
`,
};

// Provide a list of available repositories, let me choose one. It can be an ordered list of repo names and I will select one. For now let's pretend that I've chosen "saturn-frontend-web" repo with ID "1b91bb40-350c-479a-b898-6654071c91a4".
// Then provide a list of pull requests in the selected repo to choose one for review. For now let's pretend that I've chosen "36736: Add matchNonAbortedOrConditionallySkipped matcher and enhance error handling in createApiErrorReducerBuilder" pull request with ID 13329.
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
