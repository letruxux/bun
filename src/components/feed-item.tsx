"use client";

import { ImageWeserv } from "@letruxux/weserv-js";
import { HiOutlineTrash } from "react-icons/hi";
import { urlToImg } from "@/lib/utils";
import { type Feed, useMainStore } from "@/store/main-store";
import { FeedEditDialog } from "./feed-edit-dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface FeedItemProps {
	feed: Feed;
	explicitAvatars: Record<string, string>;
}

export function FeedItem({ feed, explicitAvatars }: FeedItemProps) {
	const { removeExplicitAvatar, removeFeed } = useMainStore();

	return (
		<Card className="p-2">
			<CardContent className="flex items-center px-2">
				<div
					className="h-8 w-8 rounded-full mr-2 flex items-center justify-center"
					style={{ backgroundColor: feed.color || "#3b82f6" }}
				>
					<img
						alt={feed.url}
						className="size-full rounded-full"
						src={new ImageWeserv(urlToImg(feed.url, explicitAvatars))
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
	);
}

interface ExplicitAvatarItemProps {
	host: string;
	url: string;
	explicitAvatars: Record<string, string>;
}

export function ExplicitAvatarItem({
	host,
	url,
	explicitAvatars,
}: ExplicitAvatarItemProps) {
	const { removeExplicitAvatar } = useMainStore();

	return (
		<Card className="p-2 h-16">
			<CardContent className="flex items-center px-2 h-full">
				<img
					alt={host}
					className="h-12 w-12 rounded-lg border mr-2"
					src={new ImageWeserv(urlToImg(url, explicitAvatars))
						.setWidth(40)
						.setHeight(40)
						.toString()}
				/>
				<span>
					custom avatar for <code>{host}</code>
				</span>
				<div className="grow"></div>
				<Button
					size="icon-sm"
					variant="outline"
					onClick={() => {
						removeExplicitAvatar(host);
					}}
				>
					<HiOutlineTrash className="h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	);
}
