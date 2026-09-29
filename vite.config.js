import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	base: '/html-game-engine/',
	// mariobros' own level fragments (fetched at runtime by engine
	// Router.js - see SuperMarioBros.js) live under mariobros/public/ rather
	// than a root-level public/, so the whole game stays self-contained in
	// its own folder - nothing else in this project uses publicDir today.
	publicDir: resolve(__dirname, 'mariobros/public'),
	resolve: {
		alias: {
			'~': resolve(__dirname),
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				mariobros: resolve(__dirname, 'mariobros/index.html'),
				marioworld: resolve(__dirname, 'marioworld/index.html'),
			},
		},
	},
	test: {
		environment: 'node',
		include: ['engine/test/**/*.test.js'],
	},
});
