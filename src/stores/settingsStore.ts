import { writable } from 'svelte/store';
import type { Settings } from '../bookmarks/types';

/**
 * Default settings
 */
const defaultSettings: Settings = {
    // Grid settings
    columns: 6,
    showFavicons: true,
    gridGap: 0.75, // 12px

    // Tile settings
    tilePadding: 1, // 16px
    tileBorderRadius: 0.75, // 12px
    tileMinHeight: 5, // 80px

    // Page settings
    pagePadding: 1.5, // 24px
    backgroundColor: '#f5f5f7',
    cardBackgroundColor: '#ffffff',
    cardHoverShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',

    // Typography
    titleFontSize: 0.8125, // 13px
    titleColor: '#333333',
    titleMaxLines: 2,
};

/**
 * Storage key for settings
 */
const STORAGE_KEY = 'plaintab-settings';

/**
 * Store holding user preferences.
 */
export const settingsStore = writable<Settings>(defaultSettings);

/**
 * Load settings from synced extension storage.
 */
export async function loadSettings(): Promise<void> {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
        settingsStore.set({ ...defaultSettings, ...result[STORAGE_KEY] });
    }
}

/**
 * Save settings to synced extension storage.
 */
export async function saveSettings(settings: Settings): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
    settingsStore.set(settings);
}

/**
 * Update a single setting.
 */
export async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
): Promise<void> {
    let current: Settings = defaultSettings;
    settingsStore.subscribe((s) => (current = s))();
    const newSettings = { ...current, [key]: value };
    await saveSettings(newSettings);
}
