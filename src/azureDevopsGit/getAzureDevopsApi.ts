import {getPersonalAccessTokenHandler, WebApi} from 'azure-devops-node-api';
import {ConnectionData} from 'azure-devops-node-api/interfaces/LocationsInterfaces';
import {getEnvVariable} from '../common';

let apiInstance: WebApi | null = null;
export async function getAzureDevopsApi() {
  if (apiInstance) {
    return apiInstance;
  }

  const personalAccessToken = getEnvVariable(
    'AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN',
  );
  const authHandler = getPersonalAccessTokenHandler(personalAccessToken);
  const collectionUrl = getEnvVariable('AZURE_DEVOPS_ORG_URL');
  const connection = new WebApi(collectionUrl, authHandler);
  const connectionData: ConnectionData = await connection.connect();

  console.log(`Hello ${connectionData.authenticatedUser?.customDisplayName}!`);

  apiInstance = connection;
  return apiInstance;
}
