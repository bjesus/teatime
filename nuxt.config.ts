import config from "./teatime.config.ts";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: process.env.ENV === "production" ? false : true },
  modules: ["nuxt-lucide-icons"],
  ssr: true,
  build: {
    transpile: ["vue-book-reader"],
  },
  vite: {
    build: {
      target: "es2022",
    },
  },
  app: {
    head: {
      title: config.title,
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [
        {
          rel: "icon",
          href:
            "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>" +
            config.icon +
            "</text></svg>",
        },
      ],
    },
  },
});
