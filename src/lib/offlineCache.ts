// Lightweight offline cache for listings using localStorage.

const FAVORITES_KEY = "offline_favorites_cache";
const RECENT_KEY = "offline_recently_viewed";
const MAX_RECENT = 12;

export type CachedListing = {
  id: string;
  listing_type: "sale" | "rental";
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  price_per_day?: number;
  city?: string;
  country?: string;
  images?: any;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
};

export const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

export const cacheFavorites = (items: CachedListing[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify({ items, ts: Date.now() }));
  } catch {}
};

export const readFavoritesCache = (): CachedListing[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw).items || [];
  } catch {
    return [];
  }
};

export const trackRecentlyViewed = (item: CachedListing) => {
  if (!item?.id) return;
  try {
    const existing = readRecentlyViewed();
    const filtered = existing.filter((i) => i.id !== item.id);
    const next = [item, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
};

export const readRecentlyViewed = (): CachedListing[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
};
