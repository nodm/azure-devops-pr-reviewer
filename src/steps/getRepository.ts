import type {IGitApi} from 'azure-devops-node-api/GitApi';
import select from '@inquirer/select';
import {getEnvVariable, getRepositories} from '../common';

export async function getRepository(gitApi: IGitApi) {
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
