import { browser, type Browser } from 'wxt/browser';
import type { BookmarkItem } from './types';

function nodeToItem(node: Browser.bookmarks.BookmarkTreeNode): BookmarkItem | null {
    if (node.url) {
        return { id: node.id, title: node.title || node.url, url: node.url };
    }
    // folder (no url, has children array even if empty)
    if (!node.url && node.title !== undefined) {
        const children: BookmarkItem[] = (node.children || [])
            .map(nodeToItem)
            .filter((item): item is BookmarkItem => item !== null);
        return { id: node.id, title: node.title, url: '', isFolder: true, children };
    }
    return null;
}

// Chrome's bookmarks bar is id "1"; Firefox's is "toolbar_____".
const BAR_IDS = ['1', 'toolbar_____'];

async function getBarId(): Promise<string> {
    const [root] = await browser.bookmarks.getTree();
    const bar = root?.children?.find((c) => BAR_IDS.includes(c.id));
    return bar?.id ?? BAR_IDS[0];
}

/**
 * Get all direct children of the Bookmarks Bar as display items (bookmarks + folders).
 */
export async function getBookmarksBar(): Promise<BookmarkItem[]> {
    const [bar] = await browser.bookmarks.getSubTree(await getBarId());
    return (bar?.children ?? [])
        .map(nodeToItem)
        .filter((item): item is BookmarkItem => item !== null);
}

/**
 * Move a bookmark or folder to a new index in the Bookmarks Bar.
 * toIndex is the 0-based display index (maps directly to the browser's index since we show all children).
 */
export async function moveBookmark(id: string, toIndex: number): Promise<void> {
    await browser.bookmarks.move(id, { parentId: await getBarId(), index: toIndex });
}

/**
 * Update a bookmark's title and URL.
 */
export async function updateBookmark(id: string, title: string, url: string): Promise<void> {
    await browser.bookmarks.update(id, { title, url });
}

/**
 * Delete a bookmark.
 */
export async function deleteBookmark(id: string): Promise<void> {
    await browser.bookmarks.remove(id);
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
    const result = await browser.storage.sync.get(FAVICONS_STORAGE_KEY);
    const favicons = (result[FAVICONS_STORAGE_KEY] || {}) as Record<string, string>;
    return favicons[url] || null;
}

/**
 * Set custom favicon for a bookmark URL.
 */
export async function setCustomFavicon(url: string, faviconUrl: string | null): Promise<void> {
    const result = await browser.storage.sync.get(FAVICONS_STORAGE_KEY);
    const favicons = (result[FAVICONS_STORAGE_KEY] || {}) as Record<string, string>;

    if (faviconUrl) {
        favicons[url] = faviconUrl;
    } else {
        delete favicons[url];
    }

    await browser.storage.sync.set({ [FAVICONS_STORAGE_KEY]: favicons });
}

/**
 * Get all custom favicons.
 */
export async function getAllCustomFavicons(): Promise<Record<string, string>> {
    const result = await browser.storage.sync.get(FAVICONS_STORAGE_KEY);
    return (result[FAVICONS_STORAGE_KEY] || {}) as Record<string, string>;
}
