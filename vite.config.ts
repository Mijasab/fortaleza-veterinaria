import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-auto';

export default defineConfig({
    plugins: [
        sveltekit({
            adapter: adapter()
        })
    ]
});