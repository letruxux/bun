import type Parser from "rss-parser";
import { isUrl } from "./utils";

const CORSPROXY_BASE = "https://cors.ltrx.lol/?url=";

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

export async function parseFeed(url: string) {
  const resp = await fetch(`${CORSPROXY_BASE}${encodeURIComponent(url)}`);
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
      }))
      .filter((e) => e.url),
  };
}
