import Parser from "rss-parser";

const CORSPROXY_BASE = "https://corsproxy.io/?url=";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type CustomFeed = {};

interface CustomItem {
  mediaContent?: {
    $: {
      url: string;
      medium?: string;
    };
  }[];
}

function isUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [["media:content", "mediaContent", { keepArray: true }]],
  },
});

export async function parseFeed(url: string) {
  const resp = await fetch(`${CORSPROXY_BASE}${encodeURIComponent(url)}`);
  const text = await resp.text();
  const feed = await parser.parseString(text);

  return {
    ...feed,
    items: feed.items
      .map((e) => ({
        ...e,
        imageUrl: e.mediaContent?.at(0)?.$.url ?? feed.image?.url,
        url: isUrl(e.link ?? "") ? e.link : undefined,
      }))
      .filter((e) => e.url),
  };
}
