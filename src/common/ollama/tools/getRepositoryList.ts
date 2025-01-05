import type {Tool} from 'ollama';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

export const getRepositoryListTool: Tool = {
  type: 'function',
  function: {
    name: 'get-repository-list',
    description: 'Get a list of repositories in a project from Azure DevOps',
    parameters: {
      type: 'object',
      properties: {
        project: {type: 'string', description: 'The project name'},
      },
      required: ['project'],
    },
  },
};

export function getRepositoryListHandler() {
  return {
    [getRepositoryListTool.function.name]: async ({
      project,
    }: {
      project: string;
    }) => {
      try {
        const azureDevOpsApi = await getAzureDevopsApi();
        const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);
        const repositoryList = await azureDevopsGitApi.getRepositories(project);

        return `
The following repositories are available in the project "${project}":
|Repository ID| Repository Name |
|-------------|-----------------|
${repositoryList.map(repo => `|${repo.id}| ${repo.name} |`).join('\n')}
`;
      } catch {
        return 'An error occurred while fetching the repositories';
      }
    },
  };
}
