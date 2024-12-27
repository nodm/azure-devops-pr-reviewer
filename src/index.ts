import {getApi, getGitApi} from './common';
import {
  getCodeReview,
  getPullRequest,
  getPullRequestFiles,
  getRepository,
} from './steps';

async function main() {
  const api = await getApi();
  const gitApi = await getGitApi(api);

  const repository = await getRepository(gitApi);

  const pullRequest = await getPullRequest(gitApi, repository);

  const files = await getPullRequestFiles(gitApi, pullRequest);

  const codeReview = await getCodeReview(files);

  console.log(codeReview);
}

void main();
