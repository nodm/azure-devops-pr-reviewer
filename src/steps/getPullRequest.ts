import type {IGitApi} from 'azure-devops-node-api/GitApi';
import {
  type GitRepository,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import select from '@inquirer/select';
import {getEnvVariable, getPullRequests} from '../common';

export async function getPullRequest(
  gitApi: IGitApi,
  repository: GitRepository,
) {
  const pullRequests = await getPullRequests(gitApi, repository, {
    status: PullRequestStatus.Active,
  });
  if (!pullRequests || !pullRequests.length) {
    throw new Error('No pull request found');
  }

  let pullRequestCreators: string[] | undefined;
  try {
    pullRequestCreators = getEnvVariable('PULL_REQUEST_CREATOR_UNIQUE_NAMES')
      .split(',')
      .map(creator => creator.trim().toLocaleLowerCase());
  } catch {
    // Do not filter by creator
  }
  const pullRequestsFiltered = pullRequestCreators
    ? pullRequests.filter(pullRequest => {
        if (!pullRequestCreators) return true;

        return pullRequestCreators.includes(
          (pullRequest.createdBy?.uniqueName ?? '').toLocaleLowerCase(),
        );
      })
    : pullRequests;

  const pullRequest = await select({
    message: 'Select a pull request',
    choices: pullRequestsFiltered.map(pullRequest => ({
      name: `${pullRequest.createdBy?.displayName} :: ${pullRequest.title}`,
      value: pullRequest,
    })),
  });

  return pullRequest;
}
