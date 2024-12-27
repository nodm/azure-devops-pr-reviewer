import type {IGitApi} from 'azure-devops-node-api/GitApi';
import {
  type GitPullRequest,
  VersionControlChangeType,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {getPullRequestChanges, getFileContent} from '../common';

export async function getPullRequestFiles(
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
