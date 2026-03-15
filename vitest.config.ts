import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	resolve: {
		alias: {
			'@core': path.resolve(__dirname, 'src/core'),
		}
	},
	test: {
		environment: 'jsdom',
		include: [
			'test/vitest/**/*.test.ts',
		],
		globals: true,
	},
});
