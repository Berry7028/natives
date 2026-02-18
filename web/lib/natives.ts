import { promises as fs } from "node:fs";
import path from "node:path";

export type NativeEntry = {
  namespace: string;
  fileName: string;
  title: string;
};

const REPO_ROOT = path.resolve(process.cwd(), "..");
const indexCache: { current?: Promise<NativeEntry[]> } = {};

const VALID_NAME = /^[A-Za-z0-9_]+$/;
const VALID_FILE = /^[A-Za-z0-9_]+\.md$/;

function parseTitle(markdown: string, fallback: string): string {
  const heading = markdown.match(/^##\s+(.+)$/m)?.[1]?.trim();
  return heading || fallback.replace(/\.md$/i, "").toUpperCase();
}

export async function getNativeIndex(): Promise<NativeEntry[]> {
  if (!indexCache.current) {
    indexCache.current = (async () => {
      const namespaces = await fs.readdir(REPO_ROOT, { withFileTypes: true });
      const entries: NativeEntry[] = [];

      for (const nsDir of namespaces) {
        if (!nsDir.isDirectory() || !VALID_NAME.test(nsDir.name)) {
          continue;
        }

        const namespacePath = path.join(REPO_ROOT, nsDir.name);
        const files = await fs.readdir(namespacePath, { withFileTypes: true });

        for (const file of files) {
          if (!file.isFile() || !VALID_FILE.test(file.name)) {
            continue;
          }

          const fullPath = path.join(namespacePath, file.name);
          const markdown = await fs.readFile(fullPath, "utf8");

          entries.push({
            namespace: nsDir.name,
            fileName: file.name,
            title: parseTitle(markdown, file.name),
          });
        }
      }

      return entries.sort((a, b) =>
        a.namespace === b.namespace
          ? a.title.localeCompare(b.title)
          : a.namespace.localeCompare(b.namespace),
      );
    })();
  }

  return indexCache.current;
}

export function getNativeHref(entry: Pick<NativeEntry, "namespace" | "fileName">): string {
  return `/?ns=${encodeURIComponent(entry.namespace)}&fn=${encodeURIComponent(entry.fileName.replace(/\.md$/i, ""))}`;
}

export function resolveNativeFilePath(namespace: string, functionName: string): string | null {
  if (!VALID_NAME.test(namespace) || !VALID_NAME.test(functionName)) {
    return null;
  }

  return path.join(REPO_ROOT, namespace, `${functionName}.md`);
}

export async function getNativeMarkdown(namespace: string, functionName: string): Promise<string | null> {
  const filePath = resolveNativeFilePath(namespace, functionName);
  if (!filePath) {
    return null;
  }

  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export function searchNativeEntries(index: NativeEntry[], query: string, limit = 8): NativeEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return index.slice(0, limit);
  }

  const terms = normalized.split(/\s+/).filter(Boolean);

  return index
    .map((entry) => {
      const fileStem = entry.fileName.replace(/\.md$/i, "").toLowerCase();
      const title = entry.title.toLowerCase();
      const namespace = entry.namespace.toLowerCase();
      const haystack = `${namespace} ${fileStem} ${title}`;

      let score = 0;
      if (fileStem === normalized || title === normalized) {
        score += 100;
      }
      if (fileStem.includes(normalized) || title.includes(normalized)) {
        score += 60;
      }
      if (namespace.includes(normalized)) {
        score += 20;
      }

      for (const term of terms) {
        if (haystack.includes(term)) {
          score += 10;
        }
      }

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((item) => item.entry);
}
