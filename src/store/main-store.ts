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
  hiddenPostIds: z.array(z.string()).default([]),
});

type RSSSettings = z.infer<typeof RSSSettingsSchema>;

type ChangeableSettings = Partial<Omit<Omit<RSSSettings, "feeds">, "explicitAvatars">>;

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
  addHiddenPostId: (id: string) => void;

  searchEngines: SearchEngine[];
  addSearchEngine: (engine: SearchEngine) => void;
  removeSearchEngine: (engine: SearchEngine) => void;

  currentSearchEngine: SearchEngine;
  setCurrentSearchEngine: (engine: SearchEngine) => void;
  cycleSearchEngine: () => void;

  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  removeFromSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  readArticleIds: string[];
  setArticleRead: (id: string) => void;
  setArticleUnread: (id: string) => void;

  mode: "search" | "edit-feeds";
  setMode: (mode: "search" | "edit-feeds") => void;
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

const parseRSS = (s: any) => RSSSettingsSchema.parse(s);
const parseEngine = (e: SearchEngine) => SearchEngineSchema.parse(e);

export const useMainStore = create<MainState>()(
  persist(
    (set) => ({
      rssSettings: parseRSS({}),

      updateRSSSettings: (settings: ChangeableSettings) =>
        set((state) => ({
          rssSettings: parseRSS({
            ...state.rssSettings,
            ...settings,
          }),
        })),

      addFeed: (feed: string) =>
        set((state) => ({
          rssSettings: parseRSS({
            ...state.rssSettings,
            feeds: [...state.rssSettings.feeds, feed],
          }),
        })),

      removeFeed: (feed: string) =>
        set((state) => ({
          rssSettings: parseRSS({
            ...state.rssSettings,
            feeds: state.rssSettings.feeds.filter((f) => f !== feed),
          }),
        })),

      addHiddenPostId: (id: string) =>
        set((state) => ({
          rssSettings: parseRSS({
            ...state.rssSettings,
            hiddenPostIds: [...state.rssSettings.hiddenPostIds, id],
          }),
        })),

      addExplicitAvatar: (host: string, url: string) =>
        set((state) => ({
          rssSettings: parseRSS({
            ...state.rssSettings,
            explicitAvatars: {
              ...state.rssSettings.explicitAvatars,
              [host]: url,
            },
          }),
        })),

      removeExplicitAvatar: (host: string) =>
        set((state) => ({
          rssSettings: parseRSS({
            ...state.rssSettings,
            explicitAvatars: omit(state.rssSettings.explicitAvatars, [host]),
          }),
        })),

      searchEngines: DEFAULT_SEARCH_ENGINES.map(parseEngine),
      readArticleIds: [],
      setArticleRead: (id: string) =>
        set((state) => ({
          readArticleIds: [...state.readArticleIds, id],
        })),
      setArticleUnread: (id: string) =>
        set((state) => ({
          readArticleIds: state.readArticleIds.filter((e) => e !== id),
        })),

      addSearchEngine: (engine: SearchEngine) =>
        set((state) => ({
          searchEngines: [...state.searchEngines, parseEngine(engine)],
        })),

      removeSearchEngine: (engine: SearchEngine) =>
        set((state) => ({
          searchEngines: state.searchEngines.filter((e) => e !== engine).map(parseEngine),
        })),

      currentSearchEngine: parseEngine(DEFAULT_SEARCH_ENGINES[0]),

      setCurrentSearchEngine: (engine: SearchEngine) =>
        set(() => ({
          currentSearchEngine: parseEngine(engine),
        })),

      cycleSearchEngine: () =>
        set((state) => ({
          currentSearchEngine: parseEngine(
            state.searchEngines[
              (state.searchEngines.indexOf(state.currentSearchEngine) + 1) %
                state.searchEngines.length
            ],
          ),
        })),

      searchHistory: [],

      addToSearchHistory: (query: string) =>
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(
            0,
            10,
          ),
        })),

      removeFromSearchHistory: (query: string) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter((q) => q !== query),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),

      mode: "search",

      setMode: (mode: "search" | "edit-feeds") =>
        set({
          mode,
        }),
    }),
    {
      name: "storage",
      merge: (persisted, current) => {
        const p = persisted as any;

        return {
          ...current,
          ...p,
          rssSettings: RSSSettingsSchema.parse(p?.rssSettings ?? {}),
        };
      },
    },
  ),
);
