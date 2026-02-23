import type { BookmarkItem } from './types';

/**
 * Walk a bookmark tree recursively and extract only bookmark nodes (with url).
 */
function collectBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[], result: BookmarkItem[]): void {
    for (const node of nodes) {
        if (node.url) {
            result.push({
                id: node.id,
                title: node.title || node.url,
                url: node.url,
            });
        }
        if (node.children) {
            collectBookmarks(node.children, result);
        }
    }
}

/**
 * Get all bookmarks from the Bookmarks Bar.
 * The Bookmarks Bar has a fixed ID of "1" in Chrome.
 */
export async function getBookmarksBar(): Promise<BookmarkItem[]> {
    return new Promise((resolve) => {
        chrome.bookmarks.getChildren("1", (children) => {
            if (!children) {
                resolve([]);
                return;
            }

            const items: BookmarkItem[] = [];
            collectBookmarks(children, items);
            resolve(items);
        });
    });
}

/**
 * Update a bookmark's title and URL.
 */
export async function updateBookmark(id: string, title: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.update(id, { title, url }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Delete a bookmark.
 */
export async function deleteBookmark(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.remove(id, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get favicon URL for a bookmark.
 * Uses DuckDuckGo's favicon service for privacy.
 */
export function getFaviconUrl(url: string): string {
    try {
        const hostname = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
    } catch {
        return '';
    }
}

/**
 * Storage key for custom favicons
 */
const FAVICONS_STORAGE_KEY = 'plaintab-favicons';

/**
 * Get custom favicon for a bookmark URL.
 */
export async function getCustomFavicon(url: string): Promise<string | null> {
    const result = await chrome.storage.sync.get(FAVICONS_STORAGE_KEY);
    const favicons = (result[FAVICONS_STORAGE_KEY] || {}) as Record<string, string>;
    return favicons[url] || null;
}

/**
 * Set custom favicon for a bookmark URL.
 */
export async function setCustomFavicon(url: string, faviconUrl: string | null): Promise<void> {
    const result = await chrome.storage.sync.get(FAVICONS_STORAGE_KEY);
    const favicons = (result[FAVICONS_STORAGE_KEY] || {}) as Record<string, string>;

    if (faviconUrl) {
        favicons[url] = faviconUrl;
    } else {
        delete favicons[url];
    }

    await chrome.storage.sync.set({ [FAVICONS_STORAGE_KEY]: favicons });
}

/**
 * Get all custom favicons.
 */
export async function getAllCustomFavicons(): Promise<Record<string, string>> {
    const result = await chrome.storage.sync.get(FAVICONS_STORAGE_KEY);
    return (result[FAVICONS_STORAGE_KEY] || {}) as Record<string, string>;
}
