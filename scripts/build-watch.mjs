// `vite build --watch` only rebuilds when a file that's part of the JS/CSS
// module graph changes - plain static files copied from publicDir
// (mariobros' own level fragments under mariobros/public/, fetched at
// runtime by engine Router.js - see vite.config.js's publicDir comment)
// are never in that graph, so editing them alone doesn't trigger a
// rebuild (confirmed empirically: rollup's own watch.include/exclude
// glob options, which sound like they'd cover this, don't actually
// re-trigger a build for these either). This wraps the real watch-build
// with a second, independent watcher that just re-copies mariobros/public/
// into dist/ whenever anything in it changes, so both cases stay live.
import { spawn } from 'child_process';
import { cpSync, existsSync, watch } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'mariobros/public');
const outDir = join(root, 'dist');

function copyPublicDir() {
	if (!existsSync(publicDir)) return;
	cpSync(publicDir, outDir, { recursive: true });
}

const vite = spawn('npx', ['vite', 'build', '--watch'], { cwd: root, stdio: 'inherit' });
vite.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) {
	process.on(sig, () => vite.kill(sig));
}

// debounced - a single save can fire several fs events in a row
let pending = null;
watch(publicDir, { recursive: true }, () => {
	clearTimeout(pending);
	pending = setTimeout(() => {
		copyPublicDir();
		console.log('[build-watch] mariobros/public/ changed, re-copied to dist/');
	}, 100);
});

console.log('[build-watch] also watching mariobros/public/ for changes (vite build --watch misses publicDir)');
