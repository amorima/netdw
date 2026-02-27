type RateLimitRecord = {
  count: number;
  windowStart: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const subject = String(body?.subject || "").trim();
  const message = String(body?.message || "").trim();
  const honeypot = String(body?.company || "").trim();
  const formStartedAt = Number(body?.formStartedAt || 0);

  const minFillTimeMs = Number(config.contactMinFillTimeMs || 3500);
  const rateLimitWindowMs = Number(
    config.contactRateLimitWindowMs || 10 * 60 * 1000,
  );
  const rateLimitMaxRequests = Number(config.contactRateLimitMaxRequests || 5);

  const clientIp =
    getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestIP(event) ||
    "unknown";

  const now = Date.now();

  const existingLimit = rateLimitStore.get(clientIp);
  if (!existingLimit || now - existingLimit.windowStart > rateLimitWindowMs) {
    rateLimitStore.set(clientIp, { count: 1, windowStart: now });
  } else {
    existingLimit.count += 1;
    rateLimitStore.set(clientIp, existingLimit);

    if (existingLimit.count > rateLimitMaxRequests) {
      throw createError({
        statusCode: 429,
        statusMessage: "Muitas tentativas. Tenta novamente mais tarde.",
      });
    }
  }

  if (honeypot) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submissão inválida.",
    });
  }

  if (!formStartedAt || now - formStartedAt < minFillTimeMs) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submissão inválida. Tenta novamente.",
    });
  }

  if (!name || !email || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Campos obrigatórios em falta.",
    });
  }

  if (
    name.length > 120 ||
    email.length > 160 ||
    subject.length > 180 ||
    message.length > 4000
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Alguns campos excedem o limite permitido.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email inválido.",
    });
  }

  const urlMatches = message.match(/https?:\/\//gi) || [];
  if (urlMatches.length > 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "Mensagem bloqueada por proteção anti-spam.",
    });
  }

  const directusUrl = String(config.directusUrl || "").replace(/\/$/, "");
  const directusToken = String(config.directusToken || "").trim();
  const contactCollection = String(
    config.directusContactCollection || "contact_submissions",
  ).trim();

  if (!directusUrl || !contactCollection) {
    throw createError({
      statusCode: 500,
      statusMessage: "Configuração do Directus em falta no servidor.",
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (directusToken) {
    headers.Authorization = `Bearer ${directusToken}`;
  }

  const response = await fetch(`${directusUrl}/items/${contactCollection}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      email,
      ...(subject ? { subject } : {}),
      message,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let directusMessage = "Não foi possível guardar a mensagem no Directus.";

    try {
      const parsed = JSON.parse(errorBody);
      const firstError = parsed?.errors?.[0];
      directusMessage =
        firstError?.message ||
        firstError?.extensions?.reason ||
        firstError?.extensions?.code ||
        directusMessage;
    } catch {
      if (errorBody) {
        directusMessage = errorBody;
      }
    }

    throw createError({
      statusCode: response.status || 500,
      statusMessage: directusMessage,
    });
  }

  let createdId: string | null = null;

  try {
    const responseData = await response.json();
    createdId = responseData?.data?.id || null;
  } catch {
    createdId = null;
  }

  return { ok: true, id: createdId };
});
