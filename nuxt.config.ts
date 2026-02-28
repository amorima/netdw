// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    directusUrl: "https://api.netdw.tech",
    directusToken: "",
    directusContactCollection: "contact_submissions",
    contactMinFillTimeMs: 3500,
    contactRateLimitWindowMs: 600000,
    contactRateLimitMaxRequests: 5,
  },
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
        },
      ],
    },
  },
});
