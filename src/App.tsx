import RSSContainer from "@/components/rss-container";
import { cn } from "./lib/utils";
import { useMainStore } from "./store/main-store";
import SearchBar from "./components/search-bar";
import FeedSettings from "./components/feed-settings";

export default function Page() {
  const { rssSettings: settings, mode } = useMainStore();

  return (
    <div
      className={cn(
        "flex h-dvh w-dvw bg-background p-8 bg-cover",
        settings.bgUrl && `bg-[url(${JSON.stringify(settings.bgUrl)})]`,
      )}
    >
      {mode === "search" ? <SearchBar /> : <FeedSettings />}

      <RSSContainer />
    </div>
  );
}
