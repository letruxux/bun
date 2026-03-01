import { parseFeed, type ParsedFeed } from "@/lib/rss-parse";
import { useEffect, useState } from "react";

export function useFeeds(urls: string[]) {
  const [results, setResults] = useState<ParsedFeed["items"][number][]>([]);
  const [loading, setLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults([]);
    setLoading(new Set(urls));

    urls.forEach((url) => {
      parseFeed(url)
        .then((feed) => {
          setResults((r) => [...r, ...feed.items]);
        })
        .catch(console.error)
        .finally(() => {
          setLoading((prev) => {
            const next = new Set(prev);
            next.delete(url);
            return next;
          });
        });
    });
  }, [urls]);

  return {
    results,
    loading,
    isLoading: loading.size > 0,
  };
}
