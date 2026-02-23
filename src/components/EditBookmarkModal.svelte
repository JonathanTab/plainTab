<script lang="ts">
  import type { BookmarkItem } from "../bookmarks/types";

  interface Props {
    bookmark: BookmarkItem | null;
    open?: boolean;
    onSave: (
      id: string,
      title: string,
      url: string,
      faviconUrl: string | null,
    ) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onClose: () => void;
  }

  let { bookmark, open = false, onSave, onDelete, onClose }: Props = $props();

  let title = $state("");
  let url = $state("");
  let faviconUrl = $state("");
  let customFavicon = $state(false);
  let saving = $state(false);
  let deleting = $state(false);
  let error = $state("");

  $effect(() => {
    if (bookmark && open) {
      title = bookmark.title;
      url = bookmark.url;
      faviconUrl = bookmark.favicon || "";
      customFavicon = !!bookmark.favicon;
      error = "";
    }
  });

  async function handleSave(): Promise<void> {
    if (!bookmark) return;

    if (!title.trim()) {
      error = "Title is required";
      return;
    }

    if (!url.trim()) {
      error = "URL is required";
      return;
    }

    try {
      saving = true;
      error = "";
      await onSave(
        bookmark.id,
        title.trim(),
        url.trim(),
        customFavicon ? faviconUrl.trim() || null : null,
      );
      onClose();
    } catch (e) {
      error = "Failed to save bookmark";
      console.error(e);
    } finally {
      saving = false;
    }
  }

  async function handleDelete(): Promise<void> {
    if (!bookmark) return;

    if (!confirm(`Delete "${bookmark.title}"?`)) return;

    try {
      deleting = true;
      await onDelete(bookmark.id);
      onClose();
    } catch (e) {
      error = "Failed to delete bookmark";
      console.error(e);
    } finally {
      deleting = false;
    }
  }

  function handleBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if open && bookmark}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Bookmark</h2>
        <button class="close-btn" onclick={onClose} type="button">×</button>
      </div>

      <div class="modal-body">
        {#if error}
          <div class="error">{error}</div>
        {/if}

        <label>
          <span>Title</span>
          <input type="text" bind:value={title} placeholder="Bookmark title" />
        </label>

        <label>
          <span>URL</span>
          <input
            type="url"
            bind:value={url}
            placeholder="https://example.com"
          />
        </label>

        <label class="checkbox-row">
          <input type="checkbox" bind:checked={customFavicon} />
          <span>Use custom favicon</span>
        </label>

        {#if customFavicon}
          <label>
            <span>Favicon URL</span>
            <input
              type="url"
              bind:value={faviconUrl}
              placeholder="https://example.com/icon.png"
            />
          </label>
          {#if faviconUrl}
            <div class="favicon-preview">
              <img src={faviconUrl} alt="Favicon preview" />
              <span>Preview</span>
            </div>
          {/if}
        {/if}
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-danger"
          onclick={handleDelete}
          type="button"
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
        <div class="footer-right">
          <button class="btn btn-secondary" onclick={onClose} type="button">
            Cancel
          </button>
          <button
            class="btn btn-primary"
            onclick={handleSave}
            type="button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    animation: fadeIn 0.15s ease;
  }

  .modal {
    background: var(--surface, #fff);
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.2s ease;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border, #eee);
  }

  .modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--text-color, #333);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--text-muted, #666);
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: var(--text-color, #333);
  }

  .modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 14px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label span {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, #333);
  }

  input[type="text"],
  input[type="url"] {
    padding: 10px 12px;
    border: 1px solid var(--border, #d2d2d7);
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.15s ease;
  }

  input[type="text"]:focus,
  input[type="url"]:focus {
    outline: none;
    border-color: var(--btn-primary, #0071e3);
  }

  .checkbox-row {
    flex-direction: row;
    align-items: center;
    cursor: pointer;
  }

  .checkbox-row span {
    font-weight: 400;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .favicon-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg, #f5f5f7);
    border-radius: 8px;
  }

  .favicon-preview img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  .favicon-preview span {
    font-size: 12px;
    color: var(--text-muted, #666);
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid var(--border, #eee);
    gap: 12px;
  }

  .footer-right {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--btn-secondary, #f0f0f0);
    color: var(--text-color, #333);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--btn-secondary-hover, #e0e0e0);
  }

  .btn-primary {
    background: var(--btn-primary, #0071e3);
    color: #fff;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--btn-primary-hover, #0077ed);
  }

  .btn-danger {
    background: #fee2e2;
    color: #dc2626;
  }

  .btn-danger:hover:not(:disabled) {
    background: #fecaca;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
