import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/auto-icons'],
  manifest: {
    name: 'plainTab',
    description: 'A sleek new tab page displaying your bookmarks bar',
    permissions: ['bookmarks', 'storage'],
    host_permissions: ['*://*/*'], // read each bookmarked page's icon links and web manifest
    browser_specific_settings: {
      gecko: {
        id: 'plaintab@instrumenta.app',
        strict_min_version: '115.0',
        update_url: 'https://instrumenta.cc/api/blob-storage.php?id=b392e8d8857190cdcc94a264&action=download',
      },
    },
  },
});
