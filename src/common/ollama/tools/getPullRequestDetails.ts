import type {Tool} from 'ollama';
import {getAzureDevopsApi, getAzureDevopsGitApi} from '../../azureDevopsGit';

export const getPullRequestDetailsTool: Tool = {
  type: 'function',
  function: {
    name: 'get-pull-request-details',
    description: 'Get details about a pull request including the list of files',
    parameters: {
      type: 'object',
      properties: {
        repositoryId: {type: 'string', description: 'The repository ID'},
        pullRequestId: {type: 'number', description: 'The pull request ID'},
      },
      required: ['repositoryId', 'pullRequestId'],
    },
  },
};

export function getPullRequestDetailsHandler() {
  return {
    [getPullRequestDetailsTool.function.name]: async ({
      repositoryId,
      pullRequestId,
    }: {
      repositoryId: string;
      pullRequestId: number;
    }) => {
      try {
        if (!repositoryId) {
          throw new Error('Repository ID is required');
        }
        if (!pullRequestId) {
          throw new Error('Pull requests ID is required');
        }

        const azureDevOpsApi = await getAzureDevopsApi();
        const azureDevopsGitApi = await getAzureDevopsGitApi(azureDevOpsApi);

        const pullRequest = await azureDevopsGitApi.getPullRequest(
          repositoryId,
          pullRequestId,
        );

        const projectId = pullRequest?.repository?.project?.id;

        const iterations = await azureDevopsGitApi.getPullRequestIterations(
          repositoryId,
          pullRequestId,
          projectId,
        );
        if (!iterations.length) {
          throw new Error('No iterations found');
        }
        const latestIterationId = iterations.at(-1)!.id!;
        const iterationChanges =
          await azureDevopsGitApi.getPullRequestIterationChanges(
            repositoryId,
            pullRequestId,
            latestIterationId,
            projectId,
          );
        const changes = iterationChanges.changeEntries ?? [];
        const files = changes
          .filter(change => Boolean(change.item))
          .map(change => change.item!.path)
          .filter(Boolean);

        return `
The pull request details:
<pull-request>
  <id>${pullRequest.pullRequestId}</id>
  <title>${pullRequest.title}</title>
  <created-by>${pullRequest.createdBy?.displayName}</created-by>
  <creation-date>${pullRequest.creationDate}</creation-date>
  <description>
${pullRequest.description}>
  </description>
  <list-of-files>
${files.map(file => `    <file>${file}</file>`).join('\n')}
  </list-of-files>
</pull-request>`;
      } catch {
        return 'An error occurred while fetching the pull request details';
      }
    },
  };
}
