import {WebApi} from 'azure-devops-node-api/WebApi';
import type {IGitApi} from 'azure-devops-node-api/GitApi';

let gitApiInstance: IGitApi | null = null;

export async function getAzureDevopsGitApi(api: WebApi) {
  if (!gitApiInstance) {
    gitApiInstance = await api.getGitApi();
  }

  return gitApiInstance;
}
