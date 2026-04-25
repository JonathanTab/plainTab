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
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--columns, 6), 1fr);
    gap: var(--gap, 0.5rem);
    padding: var(--padding, 1.5rem);
    max-width: 1400px;
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

  @media (max-width: 1200px) {
    .grid { grid-template-columns: repeat(5, 1fr); }
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: repeat(4, 1fr); }
  }

  @media (max-width: 600px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }
</style>
