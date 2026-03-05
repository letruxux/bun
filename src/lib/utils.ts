import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function urlToImg(url: string, host2imgRec: Record<string, string>) {
  return (
    host2imgRec[new URL(url).host] ??
    `${new URL(url).origin}/favicon.ico?v=${Date.now().toString()}`
  );
}

export function dedupe<T>(arr: T[]) {
  return [...new Set(arr)];
}

export function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  return fn().catch(async (e) => {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return withRetry(fn, retries - 1);
    }
    throw e;
  });
}
