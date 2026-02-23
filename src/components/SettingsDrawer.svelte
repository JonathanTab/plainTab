<script lang="ts">
  import type { Settings } from "../bookmarks/types";

  interface Props {
    settings: Settings;
    onApply: (settings: Settings) => void;
    onClose: () => void;
    open?: boolean;
  }

  let { settings, onApply, onClose, open = false }: Props = $props();

  let localSettings = $state<Settings>({ ...settings });
  let activeTab = $state<"grid" | "style" | "typography">("grid");

  // Sync local settings when props change
  $effect(() => {
    if (open) {
      localSettings = { ...settings };
    }
  });

  function handleApply(): void {
    onApply(localSettings);
  }

  function handleBackdropClick(): void {
    onClose();
  }

  function resetToDefaults(): void {
    localSettings = {
      // Grid settings
      columns: 6,
      showFavicons: true,
      gridGap: 0.75,

      // Tile settings
      tilePadding: 1,
      tileBorderRadius: 0.75,
      tileMinHeight: 5,

      // Page settings
      pagePadding: 1.5,
      backgroundColor: "#f5f5f7",
      cardBackgroundColor: "#ffffff",
      cardHoverShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",

      // Typography
      titleFontSize: 0.8125,
      titleColor: "#333333",
      titleMaxLines: 2,
    };
  }
</script>

{#if open}
  <div class="backdrop" onclick={handleBackdropClick}></div>
  <div class="drawer" class:open>
    <div class="drawer-header">
      <h2>Settings</h2>
      <button class="close-btn" onclick={onClose} type="button">×</button>
    </div>

    <div class="tabs">
      <button
        class="tab"
        class:active={activeTab === "grid"}
        onclick={() => (activeTab = "grid")}
        type="button"
      >
        Grid
      </button>
      <button
        class="tab"
        class:active={activeTab === "style"}
        onclick={() => (activeTab = "style")}
        type="button"
      >
        Style
      </button>
      <button
        class="tab"
        class:active={activeTab === "typography"}
        onclick={() => (activeTab = "typography")}
        type="button"
      >
        Text
      </button>
    </div>

    <div class="drawer-content">
      {#if activeTab === "grid"}
        <div class="settings-group">
          <h3>Grid Layout</h3>

          <label class="setting-row">
            <span>Columns</span>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              bind:value={localSettings.columns}
            />
            <span class="value">{localSettings.columns}</span>
          </label>

          <label class="setting-row">
            <span>Gap (rem)</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.125"
              bind:value={localSettings.gridGap}
            />
            <span class="value">{localSettings.gridGap}</span>
          </label>

          <label class="setting-row">
            <span>Page Padding (rem)</span>
            <input
              type="range"
              min="0"
              max="4"
              step="0.25"
              bind:value={localSettings.pagePadding}
            />
            <span class="value">{localSettings.pagePadding}</span>
          </label>
        </div>
      {:else if activeTab === "style"}
        <div class="settings-group">
          <h3>Colors</h3>

          <label class="setting-row color-row">
            <span>Background</span>
            <input type="color" bind:value={localSettings.backgroundColor} />
          </label>

          <label class="setting-row color-row">
            <span>Card Background</span>
            <input
              type="color"
              bind:value={localSettings.cardBackgroundColor}
            />
          </label>

          <label class="setting-row color-row">
            <span>Title Color</span>
            <input type="color" bind:value={localSettings.titleColor} />
          </label>
        </div>

        <div class="settings-group">
          <h3>Card Style</h3>

          <label class="setting-row">
            <span>Padding (rem)</span>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.125"
              bind:value={localSettings.tilePadding}
            />
            <span class="value">{localSettings.tilePadding}</span>
          </label>

          <label class="setting-row">
            <span>Border Radius (rem)</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.125"
              bind:value={localSettings.tileBorderRadius}
            />
            <span class="value">{localSettings.tileBorderRadius}</span>
          </label>

          <label class="setting-row">
            <span>Min Height (rem)</span>
            <input
              type="range"
              min="3"
              max="10"
              step="0.5"
              bind:value={localSettings.tileMinHeight}
            />
            <span class="value">{localSettings.tileMinHeight}</span>
          </label>
        </div>
      {:else if activeTab === "typography"}
        <div class="settings-group">
          <h3>Text</h3>

          <label class="setting-row">
            <span>Font Size (rem)</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.0625"
              bind:value={localSettings.titleFontSize}
            />
            <span class="value">{localSettings.titleFontSize}</span>
          </label>

          <label class="setting-row">
            <span>Max Lines</span>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              bind:value={localSettings.titleMaxLines}
            />
            <span class="value">{localSettings.titleMaxLines}</span>
          </label>

          <label class="setting-row checkbox">
            <span>Show Favicons</span>
            <input type="checkbox" bind:checked={localSettings.showFavicons} />
          </label>
        </div>
      {/if}
    </div>

    <div class="drawer-footer">
      <button class="btn btn-secondary" onclick={resetToDefaults} type="button">
        Reset
      </button>
      <div class="footer-right">
        <button class="btn btn-secondary" onclick={onClose} type="button">
          Cancel
        </button>
        <button class="btn btn-primary" onclick={handleApply} type="button">
          Apply
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    animation: fadeIn 0.2s ease;
  }

  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 320px;
    background: var(--surface, #fff);
    box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
    z-index: 101;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    display: flex;
    flex-direction: column;
  }

  .drawer.open {
    transform: translateX(0);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border, #eee);
  }

  .drawer-header h2 {
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

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border, #eee);
  }

  .tab {
    flex: 1;
    padding: 12px;
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    color: var(--text-muted, #666);
    transition:
      color 0.15s ease,
      border-color 0.15s ease;
    border-bottom: 2px solid transparent;
  }

  .tab:hover {
    color: var(--text-color, #333);
  }

  .tab.active {
    color: var(--btn-primary, #0071e3);
    border-bottom-color: var(--btn-primary, #0071e3);
  }

  .drawer-content {
    flex: 1;
    padding: 16px 20px;
    overflow-y: auto;
  }

  .settings-group {
    margin-bottom: 24px;
  }

  .settings-group h3 {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted, #666);
    margin: 0 0 12px 0;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--text-color, #333);
  }

  .setting-row.checkbox {
    cursor: pointer;
    margin-top: 16px;
  }

  .setting-row span:first-child {
    flex: 1;
  }

  .setting-row input[type="range"] {
    width: 80px;
  }

  .setting-row input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--border, #ddd);
    border-radius: 4px;
    cursor: pointer;
  }

  .setting-row .value {
    min-width: 40px;
    text-align: right;
    font-weight: 500;
    font-size: 13px;
    color: var(--text-muted, #666);
  }

  .setting-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .drawer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid var(--border, #eee);
    gap: 8px;
  }

  .footer-right {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-secondary {
    background: var(--btn-secondary, #f0f0f0);
    color: var(--text-color, #333);
  }

  .btn-secondary:hover {
    background: var(--btn-secondary-hover, #e0e0e0);
  }

  .btn-primary {
    background: var(--btn-primary, #0071e3);
    color: #fff;
  }

  .btn-primary:hover {
    background: var(--btn-primary-hover, #0077ed);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
