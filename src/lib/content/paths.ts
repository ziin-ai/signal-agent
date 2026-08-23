import { existsSync } from "node:fs";
import { resolve } from "node:path";

function readContentRootEnv(): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env.CONTENT_ROOT?.trim() : undefined;
  if (fromProcess) return fromProcess;

  try {
    const value = (import.meta.env as { CONTENT_ROOT?: string }).CONTENT_ROOT?.trim();
    if (value) return value;
  } catch {
    // ignore
  }

  return undefined;
}

/** Runtime markdown root. Defaults to repo `src/content`, then image `/app/content`. */
export function resolveContentRoot(): string {
  const fromEnv = readContentRootEnv();
  const candidates = [
    fromEnv,
    resolve(process.cwd(), "src/content"),
    resolve(process.cwd(), "content"),
    "/app/content",
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]!;
}

export function collectionDir(collection: "posts" | "events" | "media"): string {
  return resolve(resolveContentRoot(), collection);
}
