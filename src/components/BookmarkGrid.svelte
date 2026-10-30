<script lang="ts">
  import type { BookmarkItem, Settings } from "../bookmarks/types";
  import BookmarkItemComponent from "./BookmarkItem.svelte";

  interface Props {
    bookmarks: BookmarkItem[];
    settings: Settings;
    onEdit?: (bookmark: BookmarkItem) => void;
    onReorder?: (fromIndex: number, toIndex: number) => void;
  }

  let { bookmarks, settings, onEdit, onReorder }: Props = $props();

  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);

  function handleDragStart(e: DragEvent, index: number): void {
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
  }

  function handleDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    dropIndex = index;
  }

  function handleDrop(e: DragEvent, index: number): void {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorder?.(dragIndex, index);
    }
    dragIndex = null;
    dropIndex = null;
  }

  function handleDragEnd(): void {
    dragIndex = null;
    dropIndex = null;
  }
</script>

<div
  class="grid"
  style="
    --columns: {settings.columns};
    --gap: {settings.gridGap}rem;
    --padding: {settings.pagePadding}rem;
  "
>
  {#each bookmarks as bookmark, i (bookmark.id)}
    <div
      class="drag-wrapper"
      class:is-dragging={dragIndex === i}
      class:is-drop-target={dropIndex === i && dragIndex !== i}
      draggable="true"
      ondragstart={(e) => handleDragStart(e, i)}
      ondragover={(e) => handleDragOver(e, i)}
      ondrop={(e) => handleDrop(e, i)}
      ondragend={handleDragEnd}
      role="listitem"
    >
      <BookmarkItemComponent {bookmark} {settings} {onEdit} />
    </div>
  {/each}
</div>

<style>
  /* Fixed 1.5in x 1.5in tiles, up to --columns across; fewer when the window is narrower. */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 1.5in);
    justify-content: center;
    gap: var(--gap, 0.5rem);
    padding: var(--padding, 1.5rem);
    max-width: calc(
      var(--columns, 12) * 1.5in + (var(--columns, 12) - 1) * var(--gap, 0.5rem) +
        2 * var(--padding, 1.5rem)
    );
    margin: 0 auto;
  }

  .drag-wrapper {
    border-radius: 0.5rem;
    transition: opacity 0.15s ease, outline 0.1s ease;
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .drag-wrapper.is-dragging {
    opacity: 0.35;
  }

  .drag-wrapper.is-drop-target {
    outline-color: #6c63ff;
    background: rgba(108, 99, 255, 0.06);
  }
</style>
