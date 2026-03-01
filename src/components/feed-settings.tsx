"use client";

import { useMainStore } from "@/store/main-store";
import { Card, CardContent } from "./ui/card";
import { HiOutlineLink, HiOutlineTrash, HiPlus } from "react-icons/hi";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { isUrl, urlToImg } from "@/lib/utils";
import { ImageWeserv } from "@letruxux/weserv-js";
import { Checkbox } from "./ui/checkbox";

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
  const [justAvatarMode, setJustAvatarMode] = useState(false);

  const justTheExplicitAvatars = useMemo(() => {
    /* get all the explicit avatars that dont have a feed url */
    const explicitAvatars = Object.entries(settings.explicitAvatars).filter(
      ([host]) => !settings.feeds.some((e) => new URL(e).host === host),
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
                  if (!justAvatarMode) addFeed(newFeedUrl);
                  if (newFeedLogoUrl)
                    addExplicitAvatar(new URL(newFeedUrl).host, newFeedLogoUrl);

                  setNewFeedUrl("");
                  setNewFeedLogoUrl("");
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
          {settings.feeds.map((e) => (
            <Card className="p-2">
              <CardContent className="flex items-center px-2">
                <img
                  alt={e}
                  className="h-4 w-4 rounded-full mr-2"
                  src={new ImageWeserv(urlToImg(e, settings.explicitAvatars))
                    .setWidth(40)
                    .setHeight(40)
                    .toString()}
                />
                <code>{e}</code>
                <div className="grow"></div>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    removeExplicitAvatar(new URL(e).host);
                    removeFeed(e);
                  }}
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <div className="border-b my-4" />
          {justTheExplicitAvatars.map((e) => (
            <Card className="p-2 h-16">
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
