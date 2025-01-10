import {tool} from '@langchain/core/tools';
import {z} from 'zod';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

const schema = z.object({
  repositoryId: z.string().describe('The repository ID'),
  pullRequestId: z.number().describe('The pull request ID'),
  comment: z.string().describe('The comment to add'),
});

export const addCommentToAzureDevOpsPullRequestTool = tool(
  addCommentToAzureDevOpsPullRequest,
  {
    name: 'addCommentToAzureDevOpsPullRequest',
    description: 'Add a comment to a pull request in the Azure DevOps Git',
    schema,
  },
);

async function addCommentToAzureDevOpsPullRequest({
  repositoryId,
  pullRequestId,
  comment,
}: z.infer<typeof schema>) {
  try {
    if (!repositoryId) {
      throw new Error('Repository ID is required');
    }
    if (!pullRequestId) {
      throw new Error('Pull requests ID is required');
    }
    if (!comment) {
      throw new Error('Comment is required');
    }

    const azureDevOpsApi = await getAzureDevopsApi();
    const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);

    const pullRequest = await azureDevopsGitApi.getPullRequest(
      repositoryId,
      pullRequestId,
    );

    const projectId = pullRequest?.repository?.project?.id;

    void (await azureDevopsGitApi.createThread(
      {comments: [{content: comment}]},
      repositoryId,
      pullRequestId,
      projectId,
    ));

    return 'The comment was added successfully';
  } catch {
    return 'An error occurred while fetching the pull request details';
  }
}
