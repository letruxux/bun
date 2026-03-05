import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	/* build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (
              id.includes("@radix-ui") ||
              id.includes("radix-ui") ||
              id.includes("cmdk") ||
              id.includes("vaul") ||
              id.includes("embla-carousel") ||
              id.includes("input-otp") ||
              id.includes("react-resizable-panels")
            ) {
              return "vendor-radix";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            ) {
              return "vendor-ui";
            }
            if (
              id.includes("rss-parser") ||
              id.includes("dayjs") ||
              id.includes("date-fns") ||
              id.includes("zod") ||
              id.includes("zustand") ||
              id.includes("swr") ||
              id.includes("sonner") ||
              id.includes("next-themes")
            ) {
              return "vendor-misc";
            }
          }
        },
      },
    },
  }, */
});
