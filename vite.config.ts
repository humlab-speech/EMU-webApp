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
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('d3-selection') || id.includes('d3-zoom') || id.includes('d3-interpolate') || id.includes('d3-transition') || id.includes('d3-dispatch') || id.includes('d3-timer') || id.includes('d3-color') || id.includes('d3-ease')) {
						return 'd3';
					}
				},
			},
		},
	},
});
