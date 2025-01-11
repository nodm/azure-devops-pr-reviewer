import {input} from '@inquirer/prompts';
import {ChatPromptTemplate, MessagesPlaceholder} from '@langchain/core/prompts';
import {HumanMessage} from '@langchain/core/messages';
import {ChatMessageHistory} from 'langchain/stores/message/in_memory';
import {getEnvVariable} from './common';
import {systemPromptTemplate, userPromptTemplate} from './prompts';
import {azureDevOpsTools, uiTools} from './tools';
import {getLLM} from './models';

const llmProvider = getEnvVariable('LLM_PROVIDER');
const projectName = getEnvVariable('AZURE_DEVOPS_PROJECT_NAME');
const repositoryName = getEnvVariable(
  'AZURE_DEVOPS_DEFAULT_REPOSITORY_NAME',
  '',
);

const llm = getLLM(llmProvider);
export async function codeReviewChat() {
  console.log(`\x1b[32mHello from ${getEnvVariable('OLLAMA_MODEL')}!\x1b[0m`);

  const chatMessageHistory = new ChatMessageHistory();
  await chatMessageHistory.addMessage(await systemPromptTemplate.format({}));
  await chatMessageHistory.addMessage(
    await userPromptTemplate.format({projectName, repositoryName}),
  );

  const tools = [...azureDevOpsTools, ...uiTools];
  const llmWithTools = llm.bindTools(tools);

  const prompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('messages'),
  ]);
  const chain = prompt.pipe(llmWithTools);

  let isCompleted = false;
  while (!isCompleted) {
    const aiMessage = await chain.invoke({
      messages: await chatMessageHistory.getMessages(),
    });
    await chatMessageHistory.addMessage(aiMessage);

    if (aiMessage.content) {
      console.log(`\x1b[32m${aiMessage.content}\x1b[0m`);
    }

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        const selectedTool = tools.find(tool => tool.name === toolCall.name);

        if (selectedTool) {
          console.log('>>>', 'Calling tool:', selectedTool.name, toolCall.args);
          const toolMessage = await selectedTool.invoke(toolCall);
          console.log('>>>', 'Calling tool:', selectedTool.name, 'done');

          await chatMessageHistory.addMessage(toolMessage);
        } else {
          // TODO
          console.log('Tool not found', toolCall.name);
        }
      }
    } else {
      const userInput = await input({message: '>>>'});

      if (userInput !== '/bye') {
        await chatMessageHistory.addMessage(new HumanMessage(userInput));
      } else {
        isCompleted = true;
      }
    }
  }

  console.log(await chatMessageHistory.getMessages());
}
