export function requireEnv(name: string): string {
  const v = Bun.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}
