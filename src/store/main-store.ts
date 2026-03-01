import { create } from "zustand";
import { persist } from "zustand/middleware";
import z from "zod";

const RSSSettingsSchema = z.object({
  showImages: z.boolean().default(true),
  hidePostsWithNoDate: z.boolean().default(false),
  feeds: z.array(z.string()).default([]),
  explicitAvatars: z.record(z.hostname(), z.url()).default({}),
  bgUrl: z.url().optional(),
  showArticleArrow: z.boolean().default(true),
});

type RSSSettings = z.infer<typeof RSSSettingsSchema>;

type ChangeableSettings = Exclude<Exclude<RSSSettings, "feeds">, "explicitAvatars">;

const SearchEngineSchema = z.object({
  name: z.string(),
  iconUrl: z.url(),
  urlFormatter: z.url().includes("{{QUERY}}"),
});

type SearchEngine = z.infer<typeof SearchEngineSchema>;

interface MainState {
  rssSettings: RSSSettings;
  updateRSSSettings: (settings: ChangeableSettings) => void;
  addFeed: (feed: string) => void;
  removeFeed: (feed: string) => void;
  addExplicitAvatar: (host: string, url: string) => void;
  removeExplicitAvatar: (host: string) => void;

  searchEngines: SearchEngine[];
  addSearchEngine: (engine: SearchEngine) => void;
  removeSearchEngine: (engine: SearchEngine) => void;

  currentSearchEngine: SearchEngine;
  setCurrentSearchEngine: (engine: SearchEngine) => void;
  cycleSearchEngine: () => void;
}

const DEFAULT_SEARCH_ENGINES = [
  {
    name: "Google",
    iconUrl: "https://google.com/favicon.ico",
    urlFormatter: "https://google.com/search?q={{QUERY}}",
  },
  {
    name: "DuckDuckGo",
    iconUrl: "https://duckduckgo.com/favicon.ico",
    urlFormatter: "https://duckduckgo.com/?q={{QUERY}}",
  },
  {
    name: "Bing",
    iconUrl: "https://bing.com/favicon.ico",
    urlFormatter: "https://bing.com/search?q={{QUERY}}",
  },
  {
    name: "Brave",
    iconUrl:
      "https://cdn.search.brave.com/serp/v3/_app/immutable/assets/brave-search-icon.CDIU881K.svg",
    urlFormatter: "https://search.brave.com/search?q={{QUERY}}",
  },
];

function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (!keys.includes(key as unknown as K)) {
      result[key] = obj[key];
    }
  }
  return result as Omit<T, K>;
}

export const useMainStore = create<MainState>()(
  persist(
    (set) => ({
      rssSettings: RSSSettingsSchema.parse({}),
      updateRSSSettings: (settings: ChangeableSettings) =>
        set((state) => ({
          rssSettings: {
            ...state.rssSettings,
            ...settings,
          },
        })),

      addFeed: (feed: string) =>
        set((state) => ({
          rssSettings: {
            ...state.rssSettings,
            feeds: [...state.rssSettings.feeds, feed],
          },
        })),
      removeFeed: (feed: string) =>
        set((state) => ({
          rssSettings: {
            ...state.rssSettings,
            feeds: state.rssSettings.feeds.filter((f) => f !== feed),
          },
        })),

      addExplicitAvatar: (host: string, url: string) =>
        set((state) => ({
          rssSettings: {
            ...state.rssSettings,
            explicitAvatars: { ...state.rssSettings.explicitAvatars, [host]: url },
          },
        })),
      removeExplicitAvatar: (host: string) =>
        set((state) => ({
          rssSettings: {
            ...state.rssSettings,
            explicitAvatars: omit(state.rssSettings.explicitAvatars, [host]),
          },
        })),

      searchEngines: DEFAULT_SEARCH_ENGINES,
      addSearchEngine: (engine: SearchEngine) =>
        set((state) => ({
          searchEngines: [...state.searchEngines, SearchEngineSchema.parse(engine)],
        })),
      removeSearchEngine: (engine: SearchEngine) =>
        set((state) => ({
          searchEngines: state.searchEngines.filter((e) => e !== engine),
        })),

      currentSearchEngine: DEFAULT_SEARCH_ENGINES[0],
      setCurrentSearchEngine: (engine: SearchEngine) =>
        set(() => ({
          currentSearchEngine: engine,
        })),
      cycleSearchEngine: () =>
        set((state) => ({
          currentSearchEngine:
            state.searchEngines[
              (state.searchEngines.indexOf(state.currentSearchEngine) + 1) %
                state.searchEngines.length
            ],
        })),
    }),
    {
      name: "storage",
    },
  ),
);
