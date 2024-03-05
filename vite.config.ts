import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		react(),
		nodePolyfills({
			protocolImports: true,
			overrides: {
				// Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
				fs: 'memfs',
			},
		}),
	],
})
