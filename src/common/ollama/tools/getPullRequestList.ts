import type {Tool} from 'ollama';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';
import {getEnvVariable} from '../../getEnvVariable';

export const getPullRequestListTool: Tool = {
  type: 'function',
  function: {
    name: 'get-pull-request-list',
    description:
      'Get a list of pull requests from Azure DevOps Git by a repository ID ',
    parameters: {
      type: 'object',
      properties: {
        repositoryId: {type: 'string', description: 'The repository ID'},
      },
      required: ['repositoryId'],
    },
  },
};

export function getPullRequestListHandler() {
  return {
    [getPullRequestListTool.function.name]: async ({
      repositoryId,
    }: {
      repositoryId: string;
    }) => {
      try {
        if (!repositoryId) {
          throw new Error('Repository ID is required');
        }

        const azureDevOpsApi = await getAzureDevopsApi();
        const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);
        const pullRequestList = await azureDevopsGitApi.getPullRequests(
          repositoryId,
          {},
        );

        let pullRequestCreators: string[] | undefined;
        try {
          pullRequestCreators = getEnvVariable(
            'PULL_REQUEST_CREATOR_UNIQUE_NAMES',
          )
            .split(',')
            .map(creator => creator.trim().toLocaleLowerCase());
        } catch {
          // Do not filter by creator
        }
        const pullRequestsFiltered = pullRequestCreators
          ? pullRequestList.filter(pullRequest => {
              if (!pullRequestCreators) return true;

              return pullRequestCreators.includes(
                (pullRequest.createdBy?.uniqueName ?? '').toLocaleLowerCase(),
              );
            })
          : pullRequestList;

        return `
The following pull requests are available in the repository with ID="${repositoryId}":
| ID | Created by | Title |
|----|------------|-------|
${pullRequestsFiltered.map(pullRequest => `| ${pullRequest.pullRequestId} | ${pullRequest.createdBy?.displayName} | ${pullRequest.title} |`).join('\n')}
`;
      } catch {
        return 'An error occurred while fetching the pull request list';
      }
    },
  };
}
