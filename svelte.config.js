import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// Specific Vercel output configuration
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			relocate: true
		}),
		alias: {
			"$lib": path.resolve('./src/lib'),
			"$components": path.resolve('./src/lib/components'),
			"@/*": path.resolve('./src/*')
			// Removing tina:server alias as we're handling it differently now
		},
	}
};

export default config;
