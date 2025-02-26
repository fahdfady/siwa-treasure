import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    // Project root directory
    root: path.resolve(__dirname),

    // Public directory for static assets
    publicDir: 'public',

    // Development server configuration
    server: {
        port: 5173,
        open: true, // Automatically open browser
        host: true, // Allow access from network
    },

    // Build configuration
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true, // Useful for debugging
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
            output: {
                // Customize output file names
                entryFileNames: 'js/[name].[hash].js',
                chunkFileNames: 'js/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash][extname]',
            }
        }
    },

    // Resolve configuration for imports
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@js': path.resolve(__dirname, 'src/js'),
            '@assets': path.resolve(__dirname, 'public/assets'),
            '@css': path.resolve(__dirname, 'public/css'),
        }
    },

    // Optimize dependencies
    optimizeDeps: {
        include: ['src/js/*.js'],
    }
});