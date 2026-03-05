import type Parser from "rss-parser";
import { isUrl } from "./utils";

const CORSPROXY_BASE = "https://cors-anywhere.com/";

type CustomFeed = object;

interface CustomItem {
  mediaContent?: {
    $: {
      url: string;
      medium?: string;
    };
  }[];
}

let parser: Parser<CustomFeed, CustomItem> | null = null;

async function getParser(): Promise<Parser<CustomFeed, CustomItem>> {
  if (!parser) {
    const ParserModule = await import("rss-parser");
    parser = new ParserModule.default({
      customFields: {
        item: [["media:content", "mediaContent", { keepArray: true }]],
      },
    });
  }
  return parser;
}

export type ParsedFeed = Awaited<ReturnType<typeof parseFeed>>;

export async function parseFeed(url: string, useCorsProxy = true) {
  const fetchUrl = useCorsProxy ? `${CORSPROXY_BASE}${url}` : url;
  const resp = await fetch(fetchUrl);
  const text = await resp.text();
  const p = await getParser();
  const feed = await p.parseString(text);

  return {
    ...feed,
    items: feed.items
      .filter((e) => e.guid)
      .map((e) => ({
        ...e,
        imageUrl: e.mediaContent?.at(0)?.$.url ?? feed.image?.url,
        url: isUrl(e.link ?? "") ? e.link : undefined,
        superUniqueId: e.guid + new URL(e.link!).host,
        feedUrl: url,
      }))
      .filter((e) => e.url),
  };
}
