import {addCommentToAzureDevOpsPullRequestTool} from './addCommentToPullRequest';
import {getAzureDevOpsPullRequestDetailsTool} from './getPullRequestDetails';
import {getAzureDevOpsPullRequestFileContentTool} from './getPullRequestFileContent';
import {getAzureDevOpsPullRequestListTool} from './getPullRequestList';
import {getAzureDevOpsRepositoryListTool} from './getRepositoryList';
export const azureDevOpsTools = [
  getAzureDevOpsRepositoryListTool,
  getAzureDevOpsPullRequestListTool,
  getAzureDevOpsPullRequestDetailsTool,
  getAzureDevOpsPullRequestFileContentTool,
  addCommentToAzureDevOpsPullRequestTool,
];
