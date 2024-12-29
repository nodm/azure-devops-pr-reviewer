import {getApi, getGitApi} from './common';
import {
  generateCodeReview,
  // getCodeReview,
  getPullRequest,
  // getPullRequestFiles,
  getRepository,
} from './steps';
// import {createComment} from './common';

async function main() {
  const api = await getApi();
  const gitApi = await getGitApi(api);

  const repository = await getRepository(gitApi);

  const pullRequest = await getPullRequest(gitApi, repository);

  await generateCodeReview(gitApi, pullRequest);
  // const files = await getPullRequestFiles(gitApi, pullRequest);

  // const codeReview = await getCodeReview(files);

  // await createComment(gitApi, pullRequest, codeReview);

  console.log(
    '\n✅ Code review has been completed, the comment has been added to the pull request',
  );
}

void main();
