import { NextResponse } from "next/server";
import {
  getFunctionNameFromFile,
  getNativeHref,
  getNativeIndex,
  searchNativeEntries,
} from "@/lib/natives";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const index = await getNativeIndex();
  const suggestions = searchNativeEntries(index, query).map((entry) => ({
    namespace: entry.namespace,
    title: entry.title,
    functionName: getFunctionNameFromFile(entry.fileName),
    href: getNativeHref(entry),
  }));

  return NextResponse.json({ suggestions });
}
