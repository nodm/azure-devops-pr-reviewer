import {input} from '@inquirer/prompts';
import {writeFileSync} from 'node:fs';
import type {Message} from 'ollama';
import {
  ollama,
  ollamaModel as model,
  getEnvVariable,
  createPrompt,
} from '../common';
import {
  addCommentToPullRequestHandler,
  addCommentToPullRequestTool,
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

let temperature = 0;
try {
  temperature = parseFloat(getEnvVariable('OLLAMA_TEMPERATURE'));
} catch {
  // Default value is used if the environment variable is not set
}

const systemMessage: Message = {
  role: 'system',
  content: createPrompt('system', {projectName}),
};

export async function generateCodeReview() {
  const userMessage: Message = {
    role: 'user',
    content: createPrompt('user'),
  };
  const messages: Message[] = [systemMessage, userMessage];

  const tools = [
    addCommentToPullRequestTool,
    getPullRequestDetailsTool,
    getPullRequestFileContentTool,
    getPullRequestListTool,
    getRepositoryListTool,
  ];
  const availableFunctions = {
    ...addCommentToPullRequestHandler(),
    ...getPullRequestDetailsHandler(),
    ...getPullRequestFileContentHandler(),
    ...getPullRequestListHandler(),
    ...getRepositoryListHandler(),
  };

  const isCompleted = false;
  while (!isCompleted) {
    const response = await ollama.chat({
      model,
      messages,
      tools,
      // stream: true,
      options: {
        temperature,
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
          console.log(
            'Calling function:',
            tool.function.name,
            'with',
            tool.function.arguments,
          );
          const args = {
            repositoryId: tool.function.arguments.repositoryId || '',
            pullRequestId: tool.function.arguments.pullRequestId || 0,
            file: tool.function.arguments.file || '',
            projectId: tool.function.arguments.projectId || '',
            comment: tool.function.arguments.comment || '',
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
      console.log(`\x1b[32m${response.message.content}\x1b[0m`);

      const userInput = await input({message: '>>>'});
      if (userInput === '/bye') {
        // save the chat to the file
        writeFileSync(
          'chat.txt',
          JSON.stringify(
            messages.map(message => `${message.role}: ${message.content}`),
            null,
            2,
          ),
          'utf-8',
        );

        return;
      }

      messages.push({
        role: 'user',
        content: userInput,
      });
    }
  }

  // console.log('='.repeat(100));
  // console.log(JSON.stringify(messages, null, 2));
}
