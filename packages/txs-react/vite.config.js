import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules'

// todo: would be cool to create a util that grabs all toasts and generates the top level folder pacakge.json and vite entry config

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        'toasts/ClassicToast/ClassicToast': './src/toasts/ClassicToast/ClassicToast.tsx',
        'toasts/EmojiToast/EmojiToast': './src/toasts/EmojiToast/EmojiToast.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.includes('Toast')) return `toasts/[name]/[name][extname]`
        },
      },
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'wagmi',
        'wagmi/chains',
        'ethers',
        '@zag-js/react',
        '@zag-js/toast',
      ],
    },
    target: 'esnext',
    sourcemap: true,
    cssCodeSplit: true,
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [react(), optimizeCssModules()],
})
