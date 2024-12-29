import type {IGitApi} from 'azure-devops-node-api/GitApi';
import type {GitPullRequest} from 'azure-devops-node-api/interfaces/GitInterfaces';
import type {Tool} from 'ollama';
import {getPullRequestChanges} from '../../azureDevopsGit';

export const getPullRequestDetailsTool: Tool = {
  type: 'function',
  function: {
    name: 'get_pull_request_details',
    description: 'Get details of a pull request',
    parameters: {
      type: 'object',
      properties: {
        id: {type: 'number', description: 'The pull request ID'},
      },
      required: ['id'],
    },
  },
};

export function getPullRequestDetailsHandler(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  return {
    [getPullRequestDetailsTool.function.name]: async () => {
      const changes = await getPullRequestChanges(gitApi, pullRequest);
      const files = changes
        .filter(change => Boolean(change.item))
        .map(change => change.item!.path)
        .filter(path => Boolean(path));

      return JSON.stringify({
        id: pullRequest.pullRequestId,
        title: pullRequest.title,
        description: pullRequest.description,
        sourceBranch: pullRequest.sourceRefName,
        targetBranch: pullRequest.targetRefName,
        status: pullRequest.status,
        createdBy: pullRequest.createdBy?.displayName,
        creationDate: pullRequest.creationDate,
        url: pullRequest.url,
        files,
      });
    },
  };
}
