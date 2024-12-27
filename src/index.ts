import {getApi, getGitApi} from './common';
import {getPullRequest, getPullRequestFiles, getRepository} from './steps';

async function main() {
  const api = await getApi();
  const gitApi = await getGitApi(api);

  const repository = await getRepository(gitApi);

  const pullRequest = await getPullRequest(gitApi, repository);

  const files = await getPullRequestFiles(gitApi, pullRequest);

  console.log(files[0].content);
}

void main();
