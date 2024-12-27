import type {IGitApi} from 'azure-devops-node-api/GitApi';
import {
  type GitRepository,
  type GitPullRequest,
  PullRequestStatus,
  VersionControlChangeType,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import select from '@inquirer/select';
import {
  getApi,
  getEnvVariable,
  getGitApi,
  getPullRequests,
  getRepositories,
  getPullRequestChanges,
  getFileContent,
} from './common';

async function main() {
  const api = await getApi();
  const gitApi = await getGitApi(api);

  const repository = await getRepository(gitApi);

  const pullRequest = await getPullRequest(gitApi, repository);

  const files = await getPullRequestFiles(gitApi, pullRequest);

  console.log(files[0].content);
}

async function getRepository(gitApi: IGitApi) {
  const project = getEnvVariable('AZURE_DEVOPS_PROJECT_NAME');
  const defaultRepositoryName = getEnvVariable(
    'AZURE_DEVOPS_DEFAULT_REPOSITORY_NAME',
  );

  const repositories = await getRepositories(gitApi, project);
  let repository = repositories.find(
    repository => repository.name === defaultRepositoryName,
  );
  if (!repository) {
    repository = await select({
      message: 'Select a repository',
      choices: repositories.map(repository => ({
        name: repository.name,
        value: repository,
      })),
    });
  }

  return repository;
}

async function getPullRequest(gitApi: IGitApi, repository: GitRepository) {
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

async function getPullRequestFiles(
  gitApi: IGitApi,
  pullRequest: GitPullRequest,
) {
  const changes = await getPullRequestChanges(gitApi, pullRequest);
  const paths = changes
    .filter(
      // skip deleted files
      change => change.changeType !== VersionControlChangeType.Delete,
    )
    .filter(change => Boolean(change.item))
    .map(change => change.item!.path)
    .filter(Boolean)
    .filter(path => path!.match(/\.(ts|js)$/)); // JS and TS files only

  // eslint-disable-next-line n/no-unsupported-features/es-builtins
  const files = await Promise.allSettled(
    paths.map(async path => {
      const content = await getFileContent(gitApi, pullRequest, path!);
      return {path, content};
    }),
  );

  return files
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
}

void main();
