import { lazy, Suspense } from "react";
import RSSContainer from "@/components/rss-container";
import { cn } from "./lib/utils";
import { useMainStore } from "./store/main-store";
import { Loader2 } from "lucide-react";

const SearchBar = lazy(() => import("./components/search-bar"));
const FeedSettings = lazy(() => import("./components/feed-settings"));

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center pr-8 flex-col mt-48">
      <Loader2 className="animate-spin h-16 w-16" />
    </div>
  );
}

export default function Page() {
  const { rssSettings: settings, mode } = useMainStore();

  return (
    <div
      className={cn(
        "flex h-dvh w-dvw bg-background p-8 bg-cover",
        settings.bgUrl && `bg-[url(${JSON.stringify(settings.bgUrl)})]`,
      )}
    >
      <Suspense fallback={<LoadingFallback />}>
        {mode === "search" ? <SearchBar /> : <FeedSettings />}
      </Suspense>

      <RSSContainer />
    </div>
  );
}
