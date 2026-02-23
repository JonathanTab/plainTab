<script lang="ts">
  import { onMount } from "svelte";
  import BookmarkGrid from "../../components/BookmarkGrid.svelte";
  import SettingsDrawer from "../../components/SettingsDrawer.svelte";
  import EditBookmarkModal from "../../components/EditBookmarkModal.svelte";
  import {
    bookmarksStore,
    loadBookmarksBar,
    setupBookmarkListeners,
  } from "../../stores/bookmarksStore";
  import {
    settingsStore,
    loadSettings,
    saveSettings,
  } from "../../stores/settingsStore";
  import {
    updateBookmark,
    deleteBookmark,
    setCustomFavicon,
  } from "../../bookmarks/index";
  import type { BookmarkItem } from "../../bookmarks/types";

  let bookmarks = $derived($bookmarksStore);
  let settings = $derived($settingsStore);
  let isDrawerOpen = $state(false);
  let editingBookmark = $state<BookmarkItem | null>(null);
  let isEditModalOpen = $state(false);

  onMount(async () => {
    await Promise.all([loadBookmarksBar(), loadSettings()]);
    setupBookmarkListeners();
  });

  function openSettings(): void {
    isDrawerOpen = true;
  }

  function closeSettings(): void {
    isDrawerOpen = false;
  }

  async function applySettings(newSettings: typeof settings): Promise<void> {
    await saveSettings(newSettings);
    isDrawerOpen = false;
  }

  function handleEditBookmark(bookmark: BookmarkItem): void {
    editingBookmark = bookmark;
    isEditModalOpen = true;
  }

  function closeEditModal(): void {
    isEditModalOpen = false;
    editingBookmark = null;
  }

  async function handleSaveBookmark(
    id: string,
    title: string,
    url: string,
    faviconUrl: string | null,
  ): Promise<void> {
    // Update the bookmark in Chrome
    await updateBookmark(id, title, url);

    // Handle custom favicon
    if (editingBookmark) {
      if (faviconUrl) {
        await setCustomFavicon(url, faviconUrl);
        // If URL changed, remove old favicon mapping
        if (editingBookmark.url !== url) {
          await setCustomFavicon(editingBookmark.url, null);
        }
      } else if (editingBookmark.favicon) {
        // Remove custom favicon if user unchecked
        await setCustomFavicon(editingBookmark.url, null);
      }
    }

    // Reload bookmarks to reflect changes
    await loadBookmarksBar();
  }

  async function handleDeleteBookmark(id: string): Promise<void> {
    await deleteBookmark(id);
    await loadBookmarksBar();
  }
</script>

<div class="container" style="background: {settings.backgroundColor};">
  <header class="header">
    <h1 class="title">plainTab</h1>
    <button class="settings-btn" onclick={openSettings} type="button">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        ></path>
      </svg>
    </button>
  </header>

  <main class="main">
    {#if bookmarks.length === 0}
      <div class="empty">
        <p>No bookmarks in your Bookmarks Bar</p>
        <p class="hint">
          Add bookmarks to your browser's Bookmarks Bar to see them here
        </p>
      </div>
    {:else}
      <BookmarkGrid {bookmarks} {settings} onEdit={handleEditBookmark} />
    {/if}
  </main>

  <SettingsDrawer
    {settings}
    open={isDrawerOpen}
    onApply={applySettings}
    onClose={closeSettings}
  />

  <EditBookmarkModal
    bookmark={editingBookmark}
    open={isEditModalOpen}
    onSave={handleSaveBookmark}
    onDelete={handleDeleteBookmark}
    onClose={closeEditModal}
  />
</div>

<style>
  .container {
    min-height: 100vh;
    background: var(--bg, #f5f5f7);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color, #333);
    margin: 0;
  }

  .settings-btn {
    background: var(--card-bg, #fff);
    border: none;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted, #666);
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .settings-btn:hover {
    background: var(--card-hover, #eee);
    color: var(--text-color, #333);
  }

  .main {
    padding-bottom: 32px;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    color: var(--text-muted, #666);
  }

  .empty p {
    margin: 0;
  }

  .empty .hint {
    margin-top: 8px;
    font-size: 14px;
    opacity: 0.7;
  }
</style>
