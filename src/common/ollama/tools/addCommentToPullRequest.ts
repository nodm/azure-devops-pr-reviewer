import type {Tool} from 'ollama';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

export const addCommentToPullRequestTool: Tool = {
  type: 'function',
  function: {
    name: 'add-comment-to-pull-request',
    description: 'Add a comment to a pull request.',
    parameters: {
      type: 'object',
      properties: {
        repositoryId: {type: 'string', description: 'The repository ID'},
        pullRequestId: {type: 'number', description: 'The pull request ID'},
        comment: {type: 'string', description: 'The comment to add'},
      },
      required: ['repositoryId', 'pullRequestId', 'comment'],
    },
  },
};

export function addCommentToPullRequestHandler() {
  return {
    [addCommentToPullRequestTool.function.name]: async ({
      repositoryId,
      pullRequestId,
      comment,
    }: {
      repositoryId: string;
      pullRequestId: number;
      comment: string;
    }) => {
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
    },
  };
}
