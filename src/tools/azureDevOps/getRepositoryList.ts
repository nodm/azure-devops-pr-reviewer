import {tool} from '@langchain/core/tools';
import {z} from 'zod';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

const schema = z.object({
  projectId: z.string().describe('The project ID to get the repositories from'),
});

export const getAzureDevOpsRepositoryListTool = tool(
  getAzureDevOpsRepositoryList,
  {
    name: 'getAzureDevOpsRepositoryList',
    description:
      'Get a list of repositories from Azure DevOps Git by the project ID',
    schema,
  },
);

async function getAzureDevOpsRepositoryList({
  projectId,
}: z.infer<typeof schema>) {
  try {
    const azureDevOpsApi = await getAzureDevopsApi();
    const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);
    const repositoryList = await azureDevopsGitApi.getRepositories(projectId);

    return `
The list of the repositories available in the project "${projectId}" is provided in the table below:

| Repository ID to use in requests | Repository Name |
|----------------------------------|-----------------|
${repositoryList.map(repo => `|${repo.id}|${repo.name}|`).join('\n')} 
`;
  } catch {
    return 'An error occurred while fetching the repositories';
  }
}
