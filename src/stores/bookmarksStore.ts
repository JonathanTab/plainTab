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
    chrome.bookmarks.onCreated.addListener(() => loadBookmarksBar());
    chrome.bookmarks.onRemoved.addListener(() => loadBookmarksBar());
    chrome.bookmarks.onChanged.addListener(() => loadBookmarksBar());
    chrome.bookmarks.onMoved.addListener(() => loadBookmarksBar());
}