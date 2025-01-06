import {generateCodeReview} from './steps';

async function main() {
  await generateCodeReview();

  console.log(
    '\n✅ Code review has been completed, the comment has been added to the pull request',
  );
}

void main();
