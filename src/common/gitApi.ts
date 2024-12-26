import {WebApi} from 'azure-devops-node-api/WebApi';
import {type IGitApi} from 'azure-devops-node-api/GitApi';
import type {
  Comment,
  GitPullRequest,
  GitPullRequestSearchCriteria,
  GitRepository,
} from 'azure-devops-node-api/interfaces/GitInterfaces';

export async function getGitApi(api: WebApi) {
  const gitApi = await api.getGitApi();

  return gitApi;
}

export async function getRepositories(
  gitApi: IGitApi,
  project?: string,
): Promise<GitRepository[]> {
  const repositories = await gitApi.getRepositories(project);

  return repositories;
}

export async function getPullRequests(
  gitApi: IGitApi,
  repository: GitRepository,
  pullRequestCriteria: GitPullRequestSearchCriteria = {},
): Promise<GitPullRequest[] | void> {
  if (!repository.id) {
    throw new Error('Repository ID is required');
  }

  const pullRequests = await gitApi.getPullRequests(
    repository.id,
    pullRequestCriteria,
  );

  return pullRequests;
}

export async function createComment(
  gitApi: IGitApi,
  repository: GitRepository,
  pullRequest: GitPullRequest,
  comment: Comment,
) {
  if (!repository.id) {
    throw new Error('Repository ID is required');
  }
  if (!pullRequest.pullRequestId) {
    throw new Error('Pull request ID is required');
  }

  const threads = await gitApi.getThreads(
    repository.id,
    pullRequest.pullRequestId,
  );

  if (!threads.length) {
    throw new Error(
      `Must have an active pull request in "${repository.name}" repo with an active comment thread`,
    );
  }

  const [firstThread] = threads;
  if (!firstThread.id) {
    throw new Error('Thread ID is required');
  }

  comment = await gitApi.createComment(
    comment,
    repository.id,
    pullRequest.pullRequestId,
    firstThread.id,
  );

  return comment;
}
