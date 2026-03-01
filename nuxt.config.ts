// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    directusUrl: "https://api.netdw.tech",
    directusToken: "",
    directusContactCollection: "contact_submissions",
    directusInscricaoCollection: "inscricao",
    iaeduApiEndpoint:
      "https://api.iaedu.pt/agent-chat//api/v1/agent/cmamvd3n40000c801qeacoad2/stream",
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
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
        },
      ],
    },
  },
});
