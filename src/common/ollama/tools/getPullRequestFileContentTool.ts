import {type IGitApi} from 'azure-devops-node-api/GitApi';
import {type GitPullRequest} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {getFileContent} from '../../azureDevopsGit';
export const getPullRequestFileContentTool = {
  type: 'function',
  function: {
    name: 'get_pull_request_file_content',
    description: 'Get a content of a file in a pull request by its path',
    parameters: {
      type: 'object',
      properties: {
        path: {type: 'string', description: 'The file path'},
      },
      required: ['path'],
    },
  },
};

export function getPullRequestFileContentHandler(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  return {
    [getPullRequestFileContentTool.function.name]: async ({
      path,
    }: {
      path: string;
    }) => {
      const fileContent = await getFileContent(gitApi, pullRequest, path);

      return fileContent;
    },
  };
}
