// import {generateCodeReview} from './steps';
import {codeReviewChat} from './codeReviewChat';

async function main() {
  // await generateCodeReview();
  await codeReviewChat();

  console.log(
    '\n✅ Code review has been completed, the comment has been added to the pull request',
  );
}

void main();
