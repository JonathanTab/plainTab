import { browser } from 'wxt/browser';
import { writable } from 'svelte/store';
import type { BookmarkItem } from '../bookmarks/types';
import { getBookmarksBar } from '../bookmarks/index';

export const bookmarksStore = writable<BookmarkItem[]>([]);

export async function loadBookmarksBar(): Promise<void> {
    const items = await getBookmarksBar();
    bookmarksStore.set(items);
}

/**
 * Set up listeners for bookmark changes.
 */
export function setupBookmarkListeners(): void {
    browser.bookmarks.onCreated.addListener(() => loadBookmarksBar());
    browser.bookmarks.onRemoved.addListener(() => loadBookmarksBar());
    browser.bookmarks.onChanged.addListener(() => loadBookmarksBar());
    browser.bookmarks.onMoved.addListener(() => loadBookmarksBar());
}