import { create } from "zustand";
import { persist } from "zustand/middleware";
import z from "zod";

const RSSSettingsSchema = z.object({
  showImages: z.boolean().default(true),
  hidePostsWithNoDate: z.boolean().default(false),
  feeds: z.array(z.string()).default([]),
  explicitAvatars: z.map(z.hostname(), z.url()).default(new Map()),
  bgUrl: z.url().optional(),
  showArticleArrow: z.boolean().default(true),
});

type RSSSettings = z.infer<typeof RSSSettingsSchema>;

type ChangeableSettings = Exclude<Exclude<RSSSettings, "feeds">, "explicitAvatars">;

interface MainState {
  settings: RSSSettings;
  updateSettings: (settings: ChangeableSettings) => void;
  addFeed: (feed: string) => void;
  removeFeed: (feed: string) => void;

  addExplicitAvatar: (host: string, url: string) => void;
  removeExplicitAvatar: (host: string) => void;
}

export const useMainStore = create<MainState>()(
  persist(
    (set) => ({
      settings: RSSSettingsSchema.parse({}),
      updateSettings: (settings: ChangeableSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),

      addFeed: (feed: string) =>
        set((state) => ({
          settings: {
            ...state.settings,
            feeds: [...state.settings.feeds, feed],
          },
        })),
      removeFeed: (feed: string) =>
        set((state) => ({
          settings: {
            ...state.settings,
            feeds: state.settings.feeds.filter((f) => f !== feed),
          },
        })),

      addExplicitAvatar: (host: string, url: string) =>
        set((state) => ({
          settings: {
            ...state.settings,
            explicitAvatars: new Map([...state.settings.explicitAvatars, [host, url]]),
          },
        })),
      removeExplicitAvatar: (host: string) =>
        set((state) => ({
          settings: {
            ...state.settings,
            explicitAvatars: new Map(
              Array.from(state.settings.explicitAvatars).filter(([k]) => k !== host),
            ),
          },
        })),
    }),
    {
      name: "storage",
    },
  ),
);
