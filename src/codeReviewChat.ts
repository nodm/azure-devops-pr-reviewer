import {ChatPromptTemplate, MessagesPlaceholder} from '@langchain/core/prompts';
import {ChatMessageHistory} from 'langchain/stores/message/in_memory';
import {getEnvVariable} from './common';
import {llm} from './models/ollama';
import {systemPromptTemplate, userPromptTemplate} from './prompts';
import {getAzureDevOpsRepositoryListTool} from './tools';

const projectName = getEnvVariable('AZURE_DEVOPS_PROJECT_NAME');
export async function codeReviewChat() {
  const chatMessageHistory = new ChatMessageHistory();
  await chatMessageHistory.addMessage(
    await systemPromptTemplate.format({projectName}),
  );
  await chatMessageHistory.addMessage(await userPromptTemplate.format({}));

  const llmWithTools = llm.bindTools([getAzureDevOpsRepositoryListTool]);

  const prompt = ChatPromptTemplate.fromMessages([
    // await systemPromptTemplate.format({projectName}),
    new MessagesPlaceholder('messages'),
  ]);
  const chain = prompt.pipe(llmWithTools);

  const responseMessage = await chain.invoke({
    messages: await chatMessageHistory.getMessages(),
  });

  await chatMessageHistory.addMessage(responseMessage);

  console.log(await chatMessageHistory.getMessages());
}
