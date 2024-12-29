import type {IGitApi} from 'azure-devops-node-api/GitApi';
import type {GitPullRequest} from 'azure-devops-node-api/interfaces/GitInterfaces';
import type {Tool} from 'ollama';
import {getPullRequestChanges} from '../../azureDevopsGit';

export const getFileListFromPullRequestTool: Tool = {
  type: 'function',
  function: {
    name: 'get_files-list-from-pull_request',
    description: 'Get a list of paths to files from a pull request',
    parameters: {
      type: 'object',
      properties: {
        id: {type: 'number', description: 'The pull request ID'},
      },
      required: ['id'],
    },
  },
};

export function getFileListFromPullRequestHandler(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  return {
    [getFileListFromPullRequestTool.function.name]: async () => {
      const changes = await getPullRequestChanges(gitApi, pullRequest);
      const files = changes
        .filter(change => Boolean(change.item))
        .map(change => change.item!.path)
        .filter(path => Boolean(path));

      return files.join('\n');
    },
  };
}
