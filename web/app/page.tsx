import { AiSidebar } from "@/app/components/ai-sidebar";
import {
  getFunctionNameFromFile,
  getNativeHref,
  getNativeIndex,
  getNativeMarkdown,
  searchNativeEntries,
} from "@/lib/natives";

type SearchParams = Promise<{ ns?: string; fn?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const index = await getNativeIndex();
  const selected =
    params.ns && params.fn
      ? { namespace: params.ns, functionName: params.fn }
      : index[0]
        ? { namespace: index[0].namespace, functionName: getFunctionNameFromFile(index[0].fileName) }
        : null;

  const markdown = selected
    ? await getNativeMarkdown(selected.namespace, selected.functionName)
    : "No functions were found.";

  const initialSuggestions = searchNativeEntries(index, "").map((entry) => ({
    namespace: entry.namespace,
    title: entry.title,
    functionName: getFunctionNameFromFile(entry.fileName),
    href: getNativeHref(entry),
  }));

  return (
    <main className="layout">
      <section className="docPane">
        <header>
          <h1>GTA V Native Docs (Next.js)</h1>
          {selected && (
            <p>
              現在: {selected.namespace} / {selected.functionName}
            </p>
          )}
        </header>
        <article>
          <pre>{markdown ?? "Not found"}</pre>
        </article>
      </section>
      <AiSidebar initialSuggestions={initialSuggestions} />
    </main>
  );
}
