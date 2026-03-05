"use client";

import { useMainStore, type Feed } from "@/store/main-store";
import { Card, CardContent } from "./ui/card";
import { HiOutlineLink, HiOutlineTrash, HiPlus, HiPencilAlt } from "react-icons/hi";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { isUrl, urlToImg } from "@/lib/utils";
import { ImageWeserv } from "@letruxux/weserv-js";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

/* type Article = ParsedFeed["items"][number]; */

function FeedEditDialog({ feed }: { feed: Feed }) {
  const { updateFeed } = useMainStore();
  const [color, setColor] = useState(feed.color || "#3b82f6");
  const [useCorsProxy, setUseCorsProxy] = useState(feed.useCorsProxy);
  const [customExpression, setCustomExpression] = useState(feed.customExpression || "");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    updateFeed(feed.url, {
      color,
      useCorsProxy,
      customExpression: customExpression || undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="mr-1">
          <HiPencilAlt className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Feed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2 text-md gap-0">color</Label>
            <Input
              type="color"
              className="h-10 p-1 cursor-pointer"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={useCorsProxy}
              onClick={() => setUseCorsProxy(!useCorsProxy)}
            />
            <Label className="ml-2">use cors proxy</Label>
          </div>
          <div>
            <Label className="mb-2 text-md gap-0">custom expression</Label>
            <Input
              type="text"
              placeholder="e.g. item.title = item.title.replace(/foo/gi, 'bar')"
              value={customExpression}
              onChange={(e) => setCustomExpression(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              change it how you want, type is as follows:
              <br />
              <pre>{`type Article = {
    imageUrl?: string;
    url?: string;
    superUniqueId: string;
    mediaContent?: {
        $: {
            url: string;
            medium?: string;
        };
    }[];
    link?: string;
    guid?: string;
    title?: string;
    pubDate?: string;
    creator?: string;
    summary?: string;
    content?: string;
    isoDate?: string;
    categories?: string[];
    contentSnippet?: string;
    enclosure?: {
        url: string;
        length?: number;
        type?: string;
    };
}`}</pre>
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              cancel
            </Button>
            <Button onClick={handleSave}>save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FeedSettings() {
  const {
    rssSettings: settings,
    addFeed,
    removeFeed,
    addExplicitAvatar,
    removeExplicitAvatar,
  } = useMainStore();
  const [isAddingFeed, setIsAddingFeed] = useState(false);

  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedLogoUrl, setNewFeedLogoUrl] = useState("");
  const [newFeedColor, setNewFeedColor] = useState("#3b82f6");
  const [newFeedUseCorsProxy, setNewFeedUseCorsProxy] = useState(true);
  const [newFeedCustomExpression, setNewFeedCustomExpression] = useState("");
  const [justAvatarMode, setJustAvatarMode] = useState(false);

  const justTheExplicitAvatars = useMemo(() => {
    const explicitAvatars = Object.entries(settings.explicitAvatars).filter(
      ([host]) => !settings.feeds.some((e) => new URL(e.url).host === host),
    );

    return explicitAvatars.map(([host, url]) => ({
      host,
      url,
    }));
  }, [settings.explicitAvatars, settings.feeds]);

  const isValidEntry = useMemo(() => {
    return isUrl(newFeedUrl) && (newFeedLogoUrl ? isUrl(newFeedLogoUrl) : true);
  }, [newFeedUrl, newFeedLogoUrl]);

  return (
    <div className="w-full h-full flex items-center pr-8 flex-col">
      <div className="flex items-baseline w-full">
        <h1 className="text-xl font-bold mb-2">current feeds</h1>
        <div className="flex-1"></div>
        <Button
          size="icon-sm"
          variant="outline"
          className={isAddingFeed ? "text-accent-foreground" : ""}
          onClick={() => setIsAddingFeed((a) => !a)}
        >
          <HiPlus className="h-4 w-4" />
        </Button>
      </div>
      <Card className="w-full h-full">
        {isAddingFeed && (
          <div className="flex flex-col h-auto mx-6">
            <h1 className="font-semibold mb-2 text-xl">new feed</h1>
            <div className="grid col-span-2 grid-cols-2 gap-2">
              <div>
                <Label className="mb-2 gap-0 text-md">
                  url<span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2 text-md gap-0">
                  logo url override
                  {justAvatarMode && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  type="url"
                  value={newFeedLogoUrl}
                  onChange={(e) => setNewFeedLogoUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid col-span-2 grid-cols-2 gap-2 mt-4">
              <div>
                <Label className="mb-2 text-md gap-0">color</Label>
                <Input
                  type="color"
                  className="h-10 p-1 cursor-pointer"
                  value={newFeedColor}
                  onChange={(e) => setNewFeedColor(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <Label className="mr-2">
                  <Checkbox
                    checked={newFeedUseCorsProxy}
                    onClick={() => setNewFeedUseCorsProxy(!newFeedUseCorsProxy)}
                  />
                  use cors proxy
                </Label>
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-2 text-md gap-0">custom expression</Label>
              <Input
                type="text"
                placeholder="e.g. item.title = item.title.replace(/foo/gi, 'bar')"
                value={newFeedCustomExpression}
                onChange={(e) => setNewFeedCustomExpression(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                change it how you want, type is as follows:
                <br />
                <pre>{`type Article = {
    imageUrl?: string;
    url?: string;
    superUniqueId: string;
    mediaContent?: {
        $: {
            url: string;
            medium?: string;
        };
    }[];
    link?: string;
    guid?: string;
    title?: string;
    pubDate?: string;
    creator?: string;
    summary?: string;
    content?: string;
    isoDate?: string;
    categories?: string[];
    contentSnippet?: string;
    enclosure?: {
        url: string;
        length?: number;
        type?: string;
    };
}`}</pre>
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Label className="mr-4">
                <Checkbox
                  checked={justAvatarMode}
                  onClick={() => setJustAvatarMode(!justAvatarMode)}
                />
                just avatar
              </Label>
              <Button
                size="sm"
                disabled={!isValidEntry}
                variant={isValidEntry ? "default" : "destructive"}
                onClick={() => {
                  if (!justAvatarMode)
                    addFeed({
                      url: newFeedUrl,
                      color: newFeedColor,
                      useCorsProxy: newFeedUseCorsProxy,
                      customExpression: newFeedCustomExpression || undefined,
                    });
                  if (newFeedLogoUrl)
                    addExplicitAvatar(new URL(newFeedUrl).host, newFeedLogoUrl);

                  setNewFeedUrl("");
                  setNewFeedLogoUrl("");
                  setNewFeedColor("#3b82f6");
                  setNewFeedUseCorsProxy(true);
                  setNewFeedCustomExpression("");
                  setJustAvatarMode(false);
                  setIsAddingFeed(false);
                }}
              >
                <HiPlus className="h-4 w-4" /> add
              </Button>
            </div>
            <div className="border-b mt-6" />
          </div>
        )}
        {settings.feeds.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground">no feeds added yet</span>
          </div>
        )}
        <div className="px-6 space-y-4">
          {settings.feeds.map((feed) => (
            <Card className="p-2" key={feed.url}>
              <CardContent className="flex items-center px-2">
                <div
                  className="h-8 w-8 rounded-full mr-2 flex items-center justify-center"
                  style={{ backgroundColor: feed.color || "#3b82f6" }}
                >
                  <img
                    alt={feed.url}
                    className="size-full rounded-full"
                    src={new ImageWeserv(urlToImg(feed.url, settings.explicitAvatars))
                      .setWidth(40)
                      .setHeight(40)
                      .toString()}
                  />
                </div>
                <code className="text-xs">{feed.url}</code>
                {feed.customExpression && (
                  <span className="ml-2 text-xs text-muted-foreground">*expr*</span>
                )}
                <div className="grow"></div>
                <FeedEditDialog feed={feed} />
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    removeExplicitAvatar(new URL(feed.url).host);
                    removeFeed(feed.url);
                  }}
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <div className="border-b my-4" />
          {justTheExplicitAvatars.map((e) => (
            <Card className="p-2 h-16" key={e.host}>
              <CardContent className="flex items-center px-2 h-full">
                <img
                  alt={e.host}
                  className="h-12 w-12 rounded-lg border mr-2"
                  src={new ImageWeserv(urlToImg(e.url, settings.explicitAvatars))
                    .setWidth(40)
                    .setHeight(40)
                    .toString()}
                />
                <span>
                  custom avatar for <code>{e.host}</code>
                </span>
                <div className="grow"></div>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    removeExplicitAvatar(e.host);
                  }}
                >
                  <HiOutlineLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
