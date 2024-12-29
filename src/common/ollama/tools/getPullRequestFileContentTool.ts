import {type IGitApi} from 'azure-devops-node-api/GitApi';
import {type GitPullRequest} from 'azure-devops-node-api/interfaces/GitInterfaces';
import type {Tool} from 'ollama';
import {getFileContent} from '../../azureDevopsGit';
export const getPullRequestFileContentTool: Tool = {
  type: 'function',
  function: {
    name: 'get_pull_request_file_content',
    description:
      'Get a content of a file in a pull request, the list of files can be obtained using the get_pull_request_details function',
    parameters: {
      type: 'object',
      properties: {
        file: {type: 'string', description: 'A file from a pull request'},
      },
      required: ['file'],
    },
  },
};

export function getPullRequestFileContentHandler(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  return {
    [getPullRequestFileContentTool.function.name]: async ({
      file,
    }: {
      file: string;
    }) => {
      const fileContent = await getFileContent(gitApi, pullRequest, file);

      return fileContent;
    },
  };
}
