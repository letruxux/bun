"use client";

import { useState } from "react";
import { HiPencilAlt } from "react-icons/hi";
import { type Feed, useMainStore } from "@/store/main-store";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const DEFAULT_COLOR = "transparent";

export function FeedEditDialog({ feed }: { feed: Feed }) {
  const { updateFeed } = useMainStore();
  const [color, setColor] = useState(feed.color || DEFAULT_COLOR);
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
