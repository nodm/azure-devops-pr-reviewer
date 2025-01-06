import type {Tool} from 'ollama';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

export const getRepositoryListTool: Tool = {
  type: 'function',
  function: {
    name: 'get-repository-list',
    description:
      'Get a list of repositories from Azure DevOps Git by the project ID',
    parameters: {
      type: 'object',
      properties: {
        projectId: {type: 'string', description: 'The project ID'},
      },
      required: ['projectId'],
    },
  },
};

export function getRepositoryListHandler() {
  return {
    [getRepositoryListTool.function.name]: async ({
      projectId,
    }: {
      projectId: string;
    }) => {
      try {
        const azureDevOpsApi = await getAzureDevopsApi();
        const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);
        const repositoryList =
          await azureDevopsGitApi.getRepositories(projectId);

        return `
The list of the repositories available in the project "${projectId}" is provided in the table below:

| Repository ID to use in requests | Repository Name |
|----------------------------------|-----------------|
${repositoryList.map(repo => `|${repo.id}|${repo.name}|`).join('\n')} 
`;
      } catch {
        return 'An error occurred while fetching the repositories';
      }
    },
  };
}
