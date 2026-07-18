import type { Blogger } from '@/types';

let cachedBloggers: Blogger[] | null = null;
let loadingPromise: Promise<Blogger[]> | null = null;

/**
 * Dynamically load bloggers data (code-split from main bundle).
 * Caches in memory after first load.
 */
export async function loadBloggers(): Promise<Blogger[]> {
  if (cachedBloggers) return cachedBloggers;
  if (loadingPromise) return loadingPromise;

  loadingPromise = import('@/data/bloggers.json')
    .then((mod) => {
      cachedBloggers = (mod.default || mod) as Blogger[];
      return cachedBloggers;
    })
    .catch((err) => {
      loadingPromise = null;
      throw err;
    });

  return loadingPromise;
}

/**
 * Synchronous getter — only works after loadBloggers() has resolved.
 * Use for cases where data is known to be loaded.
 */
export function getBloggersSync(): Blogger[] {
  if (!cachedBloggers) {
    throw new Error('Bloggers not loaded yet. Call loadBloggers() first.');
  }
  return cachedBloggers;
}

/**
 * Check if bloggers data has been loaded
 */
export function isBloggersLoaded(): boolean {
  return cachedBloggers !== null;
}

/**
 * Preload bloggers data (call early, e.g. on app mount)
 */
export function preloadBloggers(): Promise<Blogger[]> {
  return loadBloggers();
}
