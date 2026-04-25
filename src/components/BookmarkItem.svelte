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
  let folderOpen = $state(false);
  let folderAnchor = $state<DOMRect | null>(null);
  let buttonEl = $state<HTMLButtonElement | null>(null);

  function getColorFromString(str: string): string {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
      "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
      "#F8B500", "#00CED1", "#FF7F50", "#9FE2BF", "#DE3163", "#40E0D0",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function getInitialLetter(title: string): string {
    const match = title.match(/[a-zA-Z0-9]/);
    return match ? match[0].toUpperCase() : "?";
  }

  let letterInitial = $derived(getInitialLetter(bookmark.title));
  let letterColor = $derived(getColorFromString(bookmark.url || bookmark.id));

  $effect(() => {
    if (bookmark.isFolder) return;
    async function loadFavicon() {
      if (!settings.showFavicons) { faviconSrc = ""; return; }
      const custom = await getCustomFavicon(bookmark.url);
      faviconSrc = custom ?? getFaviconUrl(bookmark.url);
    }
    loadFavicon();
  });

  function handleClick(): void {
    if (bookmark.isFolder) {
      folderAnchor = buttonEl?.getBoundingClientRect() ?? null;
      folderOpen = !folderOpen;
    } else {
      window.location.href = bookmark.url;
    }
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
    onEdit?.(bookmark);
    contextMenu = false;
  }

  function handleClickOutside(): void {
    contextMenu = false;
    folderOpen = false;
  }

  let lineClampStyle = $derived(`-webkit-line-clamp: ${settings.titleMaxLines};`);

  let folderChildren: BookmarkItem[] = $derived(bookmark.children ?? []);

  function hideImage(e: Event): void {
    (e.currentTarget as HTMLImageElement).style.display = 'none';
  }

  let dropdownStyle = $derived(
    folderAnchor
      ? `left: ${Math.min(folderAnchor.left, window.innerWidth - 220)}px; top: ${folderAnchor.bottom + 6}px;`
      : ""
  );
</script>

<svelte:window onclick={handleClickOutside} />

<button
  bind:this={buttonEl}
  class="tile"
  class:square={settings.squareTiles}
  class:folder={bookmark.isFolder}
  onclick={handleClick}
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
  {#if bookmark.isFolder}
    <div class="folder-icon" style="color: {letterColor};">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
      </svg>
    </div>
  {:else if settings.showFavicons && faviconSrc}
    <img src={faviconSrc} alt="" class="favicon" loading="lazy" onerror={() => (faviconSrc = "")} />
  {:else if settings.showFavicons}
    <div class="favicon-fallback" style="background-color: {letterColor};">
      {letterInitial}
    </div>
  {/if}
  <span class="title" style={lineClampStyle}>{bookmark.title}</span>
</button>

{#if folderOpen && bookmark.isFolder && folderAnchor}
  <div
    class="folder-dropdown"
    style={dropdownStyle}
    onclick={(e) => e.stopPropagation()}
    role="menu"
  >
    {#if !bookmark.children || bookmark.children.length === 0}
      <span class="folder-empty">Empty folder</span>
    {:else}
      {#each folderChildren as child (child.id)}
        <a
          class="folder-item"
          href={child.url}
          role="menuitem"
          onclick={(e) => { e.stopPropagation(); folderOpen = false; }}
        >
          {#if settings.showFavicons}
            <img
              src={getFaviconUrl(child.url)}
              alt=""
              class="folder-item-favicon"
              loading="lazy"
              onerror={hideImage}
            />
          {/if}
          <span class="folder-item-title">{child.title}</span>
        </a>
      {/each}
    {/if}
  </div>
{/if}

{#if contextMenu}
  <div
    class="context-menu"
    style="left: {contextMenuX}px; top: {contextMenuY}px;"
    onclick={(e) => e.stopPropagation()}
    role="menu"
  >
    <button class="context-menu-item" onclick={handleEdit} type="button" role="menuitem">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
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
    justify-content: center;
    padding: var(--padding, 0.5rem);
    background: var(--bg, #ffffff);
    border: none;
    border-radius: var(--border-radius, 0.5rem);
    cursor: pointer;
    text-align: center;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
    user-select: none;
    min-height: var(--min-height, 3.5rem);
    width: 100%;
  }

  .tile:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
  }

  .tile:active {
    transform: translateY(0);
  }

  .tile.square {
    aspect-ratio: 1 / 1;
  }

  .favicon {
    width: 24px;
    height: 24px;
    margin-bottom: 5px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .favicon-fallback {
    width: 24px;
    height: 24px;
    margin-bottom: 5px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    flex-shrink: 0;
  }

  .folder-icon {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
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

  /* Folder dropdown */
  .folder-dropdown {
    position: fixed;
    z-index: 1000;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 6px;
    min-width: 200px;
    max-width: 280px;
    max-height: 320px;
    overflow-y: auto;
  }

  .folder-empty {
    display: block;
    padding: 10px 12px;
    font-size: 0.8125rem;
    color: #999;
    text-align: center;
  }

  .folder-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 6px;
    text-decoration: none;
    color: #333;
    transition: background-color 0.12s ease;
    overflow: hidden;
  }

  .folder-item:hover {
    background-color: #f0f0f0;
  }

  .folder-item-favicon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .folder-item-title {
    font-size: 0.8125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .context-menu {
    position: fixed;
    z-index: 1000;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    padding: 4px;
    min-width: 150px;
  }

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #333;
    text-align: left;
    transition: background-color 0.15s ease;
  }

  .context-menu-item:hover {
    background-color: #f0f0f0;
  }

  .context-menu-item svg {
    flex-shrink: 0;
  }
</style>
