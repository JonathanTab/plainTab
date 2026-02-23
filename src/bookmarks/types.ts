/**
 * Bookmark node from the browser bookmarks API
 */
export interface BookmarkNode {
    id: string;
    title: string;
    url?: string;
    dateAdded?: number;
    children?: BookmarkNode[];
    type: 'bookmark' | 'folder' | 'separator';
    folderType?: string;
}

/**
 * Simplified bookmark item for display
 */
export interface BookmarkItem {
    id: string;
    title: string;
    url: string;
    favicon?: string;
}

/**
 * Settings for the new tab page
 */
export interface Settings {
    // Grid settings
    columns: number;
    showFavicons: boolean;
    gridGap: number; // in rem

    // Tile settings
    tilePadding: number; // in rem
    tileBorderRadius: number; // in rem
    tileMinHeight: number; // in rem

    // Page settings
    pagePadding: number; // in rem
    backgroundColor: string;
    cardBackgroundColor: string;
    cardHoverShadow: string;

    // Typography
    titleFontSize: number; // in rem
    titleColor: string;
    titleMaxLines: number;
}
