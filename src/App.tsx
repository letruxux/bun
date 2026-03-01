import RSSContainer from "@/components/rss-container";
import { cn } from "./lib/utils";
import { useMainStore } from "./store/main-store";

export default function Page() {
  const { settings } = useMainStore();

  return (
    <div
      className={cn(
        "flex h-dvh w-dvw justify-end bg-background p-8 bg-cover",
        settings.bgUrl && `bg-[url(${JSON.stringify(settings.bgUrl)})]`,
      )}
    >
      <RSSContainer />
    </div>
  );
}
