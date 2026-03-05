import { useEffect, useState } from "react";
import { type ParsedFeed, parseFeed } from "@/lib/rss-parse";
import type { Feed } from "@/store/main-store";

function applyCustomExpression(
	items: ParsedFeed["items"][number][],
	expression: string,
): ParsedFeed["items"][number][] {
	if (!expression) return items;

	try {
		return items.map((item) => {
			try {
				const itemCopy = { ...item };
				const fn = new Function("item", expression);
				return fn(itemCopy) ?? itemCopy;
			} catch {
				return item;
			}
		});
	} catch {
		return items;
	}
}

export function useFeeds(feeds: Feed[]) {
	const [results, setResults] = useState<ParsedFeed["items"][number][]>([]);
	const [loading, setLoading] = useState<Set<string>>(new Set());

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setResults([]);
		setLoading(new Set(feeds.map((f) => f.url)));

		feeds.forEach((feed) => {
			parseFeed(feed.url, feed.useCorsProxy)
				.then((parsed) => {
					const transformed = feed.customExpression
						? applyCustomExpression(parsed.items, feed.customExpression)
						: parsed.items;
					setResults((r) => [...r, ...transformed]);
				})
				.catch(console.error)
				.finally(() => {
					setLoading((prev) => {
						const next = new Set(prev);
						next.delete(feed.url);
						return next;
					});
				});
		});
	}, [feeds]);

	return {
		results,
		loading,
		isLoading: loading.size > 0,
	};
}
