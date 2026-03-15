import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			'@core': path.resolve(__dirname, 'src/core'),
		}
	},
	server: {
		port: 9000,
	},
	build: {
		outDir: 'dist',
	},
});
