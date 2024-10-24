import { defineConfig } from 'vite';

// vite.config.js
export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            terserOptions: {
                compress: {
                    drop_console: true, // Keep console.log statements
                },
            },
        },
    },
})