import {WebApi} from 'azure-devops-node-api/WebApi';
import {type IGitApi} from 'azure-devops-node-api/GitApi';
import {
  GitVersionType,
  type Comment,
  type GitPullRequest,
  type GitPullRequestSearchCriteria,
  type GitRepository,
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
  searchCriteria: GitPullRequestSearchCriteria = {},
): Promise<GitPullRequest[] | void> {
  if (!repository.id) {
    throw new Error('Repository ID is required');
  }

  const pullRequests = await gitApi.getPullRequests(
    repository.id,
    searchCriteria,
  );

  return pullRequests;
}

export async function getPullRequestChanges(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  if (!pullRequest.repository?.id) {
    throw new Error('Repository ID is required');
  }
  if (!pullRequest.repository?.project?.id) {
    throw new Error('Project ID is required');
  }
  if (!pullRequest.pullRequestId) {
    throw new Error('Pull request ID is required');
  }

  const repositoryId = pullRequest.repository.id;
  const projectId = pullRequest.repository.project.id;

  const iterations = await gitApi.getPullRequestIterations(
    repositoryId,
    pullRequest.pullRequestId,
    projectId,
  );

  if (!iterations.length) {
    throw new Error('No iterations found');
  }

  const latestIterationId = iterations.at(-1)!.id!;
  const iterationChanges = await gitApi.getPullRequestIterationChanges(
    repositoryId,
    pullRequest.pullRequestId,
    latestIterationId,
    projectId,
  );
  const changes = iterationChanges.changeEntries ?? [];

  return changes;
}

export async function getFileContent(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
  path: string,
) {
  if (!pullRequest.repository?.id) {
    throw new Error('Repository ID is required');
  }
  if (!pullRequest.repository?.project?.id) {
    throw new Error('Project ID is required');
  }

  const repositoryId = pullRequest.repository.id;
  const projectId = pullRequest.repository.project.id;

  const readableStream = await gitApi.getItemContent(
    // The name or ID of the repository.
    repositoryId,
    // The item path.
    path,
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
