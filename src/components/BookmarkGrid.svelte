<script lang="ts">
  import type { BookmarkItem, Settings } from "../bookmarks/types";
  import BookmarkItemComponent from "./BookmarkItem.svelte";

  interface Props {
    bookmarks: BookmarkItem[];
    settings: Settings;
    onEdit?: (bookmark: BookmarkItem) => void;
  }

  let { bookmarks, settings, onEdit }: Props = $props();
</script>

<div
  class="grid"
  style="
    --columns: {settings.columns};
    --gap: {settings.gridGap}rem;
    --padding: {settings.pagePadding}rem;
  "
>
  {#each bookmarks as bookmark (bookmark.id)}
    <BookmarkItemComponent {bookmark} {settings} {onEdit} />
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--columns, 6), 1fr);
    gap: var(--gap, 0.75rem);
    padding: var(--padding, 1.5rem);
    max-width: 1400px;
    margin: 0 auto;
  }

  @media (max-width: 1200px) {
    .grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
