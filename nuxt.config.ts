// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: process.env.ENV === "production" ? false : true },
  modules: ["nuxt-lucide-icons"],
  ssr: false,
  build: {
    transpile: ["vue-book-reader", ({ isDev }) => !isDev && "sql.js-httpvfs"],
  },
  vite: {
    build: {
      target: "es2022",
    },
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
});
