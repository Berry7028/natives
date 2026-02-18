"use client";

import { useMemo, useState } from "react";

type Suggestion = {
  namespace: string;
  title: string;
  functionName: string;
  href: string;
};

export function AiSidebar({ initialSuggestions }: { initialSuggestions: Suggestion[] }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buttonDisabled = useMemo(() => loading || !input.trim(), [input, loading]);

  const handleSearch = async () => {
    if (buttonDisabled) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/ai-suggest?q=${encodeURIComponent(input)}`);
      if (!response.ok) {
        setError("提案の取得に失敗しました。少し待って再試行してください。");
        return;
      }

      const data = (await response.json()) as { suggestions?: Suggestion[] };
      setSuggestions(data.suggestions ?? []);
    } catch {
      setError("通信エラーが発生しました。接続を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="aiSidebar">
      <h2>AI チャット（軽量）</h2>
      <p>探したい関数を日本語/英語で入力してください。</p>
      <div className="chatForm">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="例: プレイヤーの指名手配レベルを取得"
        />
        <button type="button" onClick={handleSearch} disabled={buttonDisabled}>
          {loading ? "検索中..." : "提案を取得"}
        </button>
      </div>
      {error && <p className="errorText">{error}</p>}
      <ul className="suggestions" aria-live="polite">
        {suggestions.map((suggestion) => (
          <li key={`${suggestion.namespace}:${suggestion.functionName}`}>
            <a href={suggestion.href}>
              <strong>{suggestion.title}</strong>
              <span>
                {suggestion.namespace} / {suggestion.functionName}
              </span>
            </a>
          </li>
        ))}
        {!suggestions.length && <li>候補が見つかりませんでした。</li>}
      </ul>
    </aside>
  );
}
