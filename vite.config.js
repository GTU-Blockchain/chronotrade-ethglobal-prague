import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    json: {
        stringify: true, // This ensures JSON files are properly handled
    },
    resolve: {
        alias: {
            // Add any path aliases if needed
        },
    },
    build: {
        rollupOptions: {
            output: {
                format: "es",
            },
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
        },
    },
});
