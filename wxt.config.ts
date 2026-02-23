import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'plainTab',
    description: 'A sleek new tab page displaying your bookmarks bar',
    permissions: ['bookmarks', 'storage'],
  },
});
