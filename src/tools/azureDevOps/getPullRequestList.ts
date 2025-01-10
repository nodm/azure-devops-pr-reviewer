import {tool} from '@langchain/core/tools';
import {z} from 'zod';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';
import {getEnvVariable} from '../../common/getEnvVariable';

const schema = z.object({
  repositoryId: z
    .string()
    .describe('The repository ID to get the pull requests from'),
});

export const getAzureDevOpsPullRequestListTool = tool(
  getAzureDevOpsPullRequestList,
  {
    name: 'getAzureDevOpsPullRequestList',
    description:
      'Get a list of pull requests from Azure DevOps Git by a repository ID',
    schema,
  },
);

async function getAzureDevOpsPullRequestList({
  repositoryId,
}: {
  repositoryId: string;
}) {
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
      pullRequestCreators = getEnvVariable('PULL_REQUEST_CREATOR_UNIQUE_NAMES')
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
}
