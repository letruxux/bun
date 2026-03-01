import { ImageWeserv } from "@letruxux/weserv-js";
import dayjs from "dayjs";
import {
  HiArrowRight,
  HiOutlineCog,
  HiOutlineEyeOff,
  HiOutlineFilter,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { parseFeed } from "@/lib/rss-parse";
import { Button } from "./ui/button";
import { useMemo } from "react";
import { useMainStore } from "@/store/main-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

function urlToImg(url: string, host2imgRec: Record<string, string>) {
  return (
    host2imgRec[new URL(url).host] ??
    `${new URL(url).origin}/favicon.ico?v=${Date.now().toString()}`
  );
}

function Article({
  item,
}: {
  item: Awaited<ReturnType<typeof parseFeed>>["items"][number];
}) {
  const { rssSettings: settings } = useMainStore();
  if (!item.url) {
    return null;
  }

  return (
    <a data-guid={item.guid} href={item.url} rel="noreferrer" target="_blank">
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="gap-y-0 overflow-x-hidden pt-0 font-bold text-x hover:scale-102 transition-transform duration-300 group relative overflow-hidden">
            <CardHeader className="mb-2 gap-y-0 space-y-1 px-0">
              {item.imageUrl && settings.showImages && (
                <div className="aspect-video h-auto w-full">
                  <img
                    alt={item.title}
                    className="h-auto w-full rounded-t-2xl"
                    src={new ImageWeserv(item.imageUrl)
                      .setOutputFormat("webp")
                      .toString()}
                  />
                </div>
              )}
              <div className="flex flex-col px-6 pt-4">
                <span className="">{item.title}</span>
                <span className="mt-0.5 flex truncate font-normal text-sm">
                  {dayjs(item.pubDate).format("DD/MM/YYYY")}
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="flex items-center">
                    <img
                      alt={item.url}
                      className="h-4 w-4 rounded-full"
                      src={new ImageWeserv(urlToImg(item.url, settings.explicitAvatars))
                        .setWidth(40)
                        .setHeight(40)
                        .toString()}
                    />
                    <span className="ml-1 font-normal text-sm">
                      <code>{new URL(item.url).host}</code>
                    </span>
                  </span>
                </span>
              </div>
            </CardHeader>
            <CardContent className="truncate font-normal text-sm">
              {item.content ?? item.contentSnippet ?? item.summary ?? (
                <span className="text-muted-foreground">no summary provided...</span>
              )}
            </CardContent>
            {settings.showArticleArrow && (
              <span className="absolute bottom-4 right-4 transform transition-transform translate-y-12 group-hover:translate-y-0 ease-out duration-200">
                <HiArrowRight className="h-4 w-4 text-accent-foreground" />
              </span>
            )}
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <HiOutlineEyeOff className="h-4 w-4 text-foreground" /> hide this post
          </ContextMenuItem>
          <ContextMenuItem variant="destructive">
            <HiOutlineEyeOff className="h-4 w-4 text-foreground" /> hide all posts from
            this domain
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </a>
  );
}

/* 
const HOST_TO_IMG = new Map([
  ["kibty.town", "https://github.com/xyzeva.png"],
  ["ud2.rip", "https://ud2.rip/icon.png"],
]);
*/

export default function RSSContainer() {
  const { data } = useSWR("https://blog.fluxer.app/rss/", parseFeed);
  const { data: data2 } = useSWR("https://kibty.town/blog.rss", parseFeed);
  const { data: data3 } = useSWR("https://vmfunc.re/rss.xml", parseFeed);

  const allFeeds = useMemo(
    () => [...(data?.items ?? []), ...(data2?.items ?? []), ...(data3?.items ?? [])],
    [data, data2, data3],
  );

  const sortedFeeds = useMemo(
    () =>
      allFeeds.sort(
        (a, b) =>
          new Date(b.pubDate ?? b.isoDate ?? new Date()).getTime() -
          new Date(a.pubDate ?? a.isoDate ?? new Date()).getTime(),
      ),
    [allFeeds],
  );

  return (
    <Card className="w-full max-w-full overflow-y-scroll px-5 pt-4 first:gap-y-4 lg:max-w-120 2xl:max-w-160 bg-background/20 backdrop-blur-xs">
      <div className="mb-0 flex items-center gap-1 pb-0 text-2xl">
        <span className="font-bold">your feeds</span>
        <div className="flex-1" />
        <Button className="ml-auto" size="icon-sm" variant="outline">
          <HiOutlinePencilAlt className="h-4 w-4" />
        </Button>
        <Button className="ml-auto" size="icon-sm" variant="outline">
          <HiOutlineFilter className="h-4 w-4" />
        </Button>
        <Button className="ml-auto" size="icon-sm" variant="outline">
          <HiOutlineCog className="h-4 w-4" />
        </Button>
      </div>
      {sortedFeeds.map((e) => (
        <Article item={e} key={e.guid} />
      ))}
    </Card>
  );
}
