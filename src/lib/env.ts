/** Reads a required server-side variable, failing loudly rather than sending a broken request. */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
