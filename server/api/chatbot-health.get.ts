export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const iaEndpoint = String(config.iaeduApiEndpoint || "").trim();
  const iaApiKey = String(config.iaeduApiKey || "").trim();
  const iaChannelId = String(config.iaeduChannelId || "").trim();
  const directusUrl = String(config.directusUrl || "").replace(/\/$/, "");

  if (!iaEndpoint || !iaApiKey || !iaChannelId || !directusUrl) {
    return {
      ok: false,
      status: "Configuração incompleta para chatbot.",
    };
  }

  try {
    const pingResponse = await fetch(`${directusUrl}/server/ping`);

    if (!pingResponse.ok) {
      return {
        ok: false,
        status: "Não foi possível validar ligação ao Directus.",
      };
    }

    return {
      ok: true,
      status: "Ligação disponível.",
    };
  } catch {
    return {
      ok: false,
      status: "Falha na verificação de ligação.",
    };
  }
});
