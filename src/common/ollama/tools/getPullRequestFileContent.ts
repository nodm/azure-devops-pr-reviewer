import {GitVersionType} from 'azure-devops-node-api/interfaces/GitInterfaces';
import type {Tool} from 'ollama';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

export const getPullRequestFileContentTool: Tool = {
  type: 'function',
  function: {
    name: 'get-pull-request-file-content',
    description: 'Get the content of a file in the a pull request',
    parameters: {
      type: 'object',
      properties: {
        repositoryId: {type: 'string', description: 'The repository ID'},
        pullRequestId: {type: 'number', description: 'The pull request ID'},
        file: {type: 'string', description: 'The file path'},
      },
      required: ['repositoryId', 'pullRequestId', 'file'],
    },
  },
};

export function getPullRequestFileContentHandler() {
  return {
    [getPullRequestFileContentTool.function.name]: async ({
      repositoryId,
      pullRequestId,
      file,
    }: {
      repositoryId: string;
      pullRequestId: number;
      file: string;
    }) => {
      try {
        if (!repositoryId) {
          throw new Error('Repository ID is required');
        }
        if (!pullRequestId) {
          throw new Error('Pull requests ID is required');
        }
        if (!file) {
          throw new Error('File is required');
        }

        const azureDevOpsApi = await getAzureDevopsApi();
        const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);

        const pullRequest = await azureDevopsGitApi.getPullRequest(
          repositoryId,
          pullRequestId,
        );

        const projectId = pullRequest?.repository?.project?.id;

        const readableStream = await azureDevopsGitApi.getItemContent(
          // The name or ID of the repository.
          repositoryId,
          // The item path.
          file,
          // Project ID or project name
          projectId,
          // The path scope.  The default is null.
          undefined,
          // The recursion level of this request. The default is 'none', no recursion.
          undefined,
          // Set to true to include content metadata.  Default is false.
          false,
          // Set to true to include the latest changes.  Default is false.
          false,
          // Set to true to download the response as a file.  Default is false.
          true,
          // Version descriptor.  Default is the default branch for the repository.
          {
            version: pullRequest.lastMergeSourceCommit?.commitId,
            versionType: GitVersionType.Commit,
          },
          // Set to true to include item content when requesting json.  Default is false.
          // Set to true to resolve Git LFS pointer files to return actual content from Git LFS.  Default is false.
          // Set to true to sanitize an svg file and return it as image. Useful only if requested for svg file. Default is false.
        );

        const chunks: Buffer[] = [];
        for await (const chunk of readableStream) {
          chunks.push(chunk as Buffer<ArrayBufferLike>);
        }
        const content = Buffer.concat(chunks);

        return content.toString('utf-8');
      } catch {
        return 'An error occurred while fetching the pull request details';
      }
    },
  };
}
