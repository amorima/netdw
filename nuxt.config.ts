// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-07-15",
  srcDir: "app",
  ssr: true,
  devtools: { enabled: true },
  runtimeConfig: {
    directusUrl: "https://api.netdw.tech",
    directusToken: "",
    directusContactCollection: "contact_submissions",
    directusInscricaoCollection: "inscricao",
    iaeduApiEndpoint:
      "https://api.iaedu.pt/agent-chat/api/v1/agent/cmamvd3n40000c801qeacoad2/stream",
    iaeduApiKey: "",
    iaeduChannelId: "cmjbdlc1r00ytgr01ebwrga95",
    iaeduDefaultThreadId: "c7DSOeeZTQ4injN8-tAIS",
    contactMinFillTimeMs: 3500,
    contactRateLimitWindowMs: 600000,
    contactRateLimitMaxRequests: 5,
    inscricaoMinFillTimeMs: 3500,
    inscricaoRateLimitWindowMs: 600000,
    inscricaoRateLimitMaxRequests: 5,
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Núcleo de Estudantes de Tecnologias e Desenvolvimento Web",
      meta: [
        {
          name: "description",
          content:
            "Plataforma oficial do NeTDW com notícias, eventos, órgãos, pelouros e contactos para a comunidade de Tecnologias e Desenvolvimento Web.",
        },
        {
          name: "theme-color",
          content: "#050812",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
        },
      ],
    },
  },
});
