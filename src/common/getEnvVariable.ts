import 'dotenv/config';

export function getEnvVariable(
  name: string,
  fallback?: string,
): string | never {
  const value = process.env[name];

  if (value) {
    return value;
  }
  if (fallback === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return fallback;
}
