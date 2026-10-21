import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';

const isDocker = !!process.env.DOCKER_BUILD;

export default defineConfig({
    plugins: [
        sveltekit({
            adapter: isDocker ? adapterNode() : adapterAuto(),
            csrf: {
                trustedOrigins: isDocker ? ['http://localhost:3000'] : []
            }
        })
    ]
});