<script lang="ts">
  import type { BookmarkItem, Settings } from "../bookmarks/types";
  import { getFaviconUrl, getCustomFavicon } from "../bookmarks/index";

  interface Props {
    bookmark: BookmarkItem;
    settings: Settings;
    onEdit?: (bookmark: BookmarkItem) => void;
  }

  let { bookmark, settings, onEdit }: Props = $props();

  let faviconSrc = $state("");
  let contextMenu = $state(false);
  let contextMenuX = $state(0);
  let contextMenuY = $state(0);

  // Load custom favicon or use default
  $effect(() => {
    async function loadFavicon() {
      if (!settings.showFavicons) {
        faviconSrc = "";
        return;
      }

      // First check for custom favicon
      const custom = await getCustomFavicon(bookmark.url);
      if (custom) {
        faviconSrc = custom;
      } else {
        faviconSrc = getFaviconUrl(bookmark.url);
      }
    }
    loadFavicon();
  });

  function openBookmark(): void {
    window.open(bookmark.url, "_blank");
  }

  function handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (onEdit) {
      contextMenuX = e.clientX;
      contextMenuY = e.clientY;
      contextMenu = true;
    }
  }

  function handleEdit(): void {
    if (onEdit) {
      onEdit(bookmark);
    }
    contextMenu = false;
  }

  function handleClickOutside(e: MouseEvent): void {
    if (contextMenu) {
      contextMenu = false;
    }
  }

  // Compute the line-clamp value
  let lineClampStyle = $derived(
    `-webkit-line-clamp: ${settings.titleMaxLines};`,
  );
</script>

<svelte:window onclick={handleClickOutside} />

<button
  class="tile"
  onclick={openBookmark}
  oncontextmenu={handleContextMenu}
  type="button"
  style="
    --padding: {settings.tilePadding}rem;
    --border-radius: {settings.tileBorderRadius}rem;
    --min-height: {settings.tileMinHeight}rem;
    --bg: {settings.cardBackgroundColor};
    --shadow: {settings.cardHoverShadow};
    --font-size: {settings.titleFontSize}rem;
    --color: {settings.titleColor};
  "
>
  {#if settings.showFavicons && faviconSrc}
    <img
      src={faviconSrc}
      alt=""
      class="favicon"
      loading="lazy"
      onerror={() => (faviconSrc = "")}
    />
  {/if}
  <span class="title" style={lineClampStyle}>{bookmark.title}</span>
</button>

{#if contextMenu}
  <div
    class="context-menu"
    style="left: {contextMenuX}px; top: {contextMenuY}px;"
    onclick={(e) => e.stopPropagation()}
    role="menu"
  >
    <button
      class="context-menu-item"
      onclick={handleEdit}
      type="button"
      role="menuitem"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        ></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        ></path>
      </svg>
      Edit Bookmark
    </button>
  </div>
{/if}

<style>
  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--padding, 1rem);
    background: var(--bg, #ffffff);
    border: none;
    border-radius: var(--border-radius, 0.75rem);
    cursor: pointer;
    text-align: center;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
    user-select: none;
    min-height: var(--min-height, 5rem);
  }

  .tile:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
  }

  .tile:active {
    transform: translateY(0);
  }

  .favicon {
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
    border-radius: 4px;
  }

  .title {
    font-size: var(--font-size, 0.8125rem);
    line-height: 1.3;
    color: var(--color, #333);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
</style>
