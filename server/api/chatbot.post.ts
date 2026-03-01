type PublicCollectionSummary = {
  collection: string;
  items: Array<Record<string, unknown>>;
};

type ParsedEvent = {
  titulo: string;
  dataEvento: string;
  tipo: string;
  sala: string;
};

type ContextPayload = {
  source: string;
  generatedAt: string;
  assistantRules: string;
  nextEvent: ParsedEvent | null;
  collections: Array<{
    collection: string;
    totalItems: number;
    items: Array<Record<string, unknown>>;
  }>;
};

function toPlainText(value: unknown) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    aacute: "á",
    agrave: "à",
    acirc: "â",
    atilde: "ã",
    eacute: "é",
    ecirc: "ê",
    iacute: "í",
    oacute: "ó",
    ocirc: "ô",
    otilde: "õ",
    uacute: "ú",
    ccedil: "ç",
    Aacute: "Á",
    Agrave: "À",
    Acirc: "Â",
    Atilde: "Ã",
    Eacute: "É",
    Ecirc: "Ê",
    Iacute: "Í",
    Oacute: "Ó",
    Ocirc: "Ô",
    Otilde: "Õ",
    Uacute: "Ú",
    Ccedil: "Ç",
  };

  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const codePoint = parseInt(entity.slice(2), 16);
      if (!Number.isNaN(codePoint)) {
        return String.fromCodePoint(codePoint);
      }
      return match;
    }

    if (entity.startsWith("#")) {
      const codePoint = parseInt(entity.slice(1), 10);
      if (!Number.isNaN(codePoint)) {
        return String.fromCodePoint(codePoint);
      }
      return match;
    }

    return namedEntities[entity] ?? match;
  });
}

function pickFields(item: Record<string, unknown>, fields: string[]) {
  const result: Record<string, unknown> = {};

  fields.forEach((field) => {
    const value = item[field];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      result[field] = value;
    }
  });

  return result;
}

async function readCollection(
  directusUrl: string,
  collection: string,
  fields: string[],
  limit: number,
  token: string,
) {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isAgendaCollection = collection === "agenda";

  const withStatusUrl = new URL(`${directusUrl}/items/${collection}`);
  withStatusUrl.searchParams.set("limit", String(limit));
  if (isAgendaCollection) {
    withStatusUrl.searchParams.set("sort[]", "data_evento");
    withStatusUrl.searchParams.set("sort[]", "date_created");
  } else {
    withStatusUrl.searchParams.set("sort[]", "sort");
    withStatusUrl.searchParams.set("sort[]", "-date_created");
  }
  withStatusUrl.searchParams.set("filter[status][_eq]", "published");
  fields.forEach((field) =>
    withStatusUrl.searchParams.append("fields[]", field),
  );

  const fallbackUrl = new URL(`${directusUrl}/items/${collection}`);
  fallbackUrl.searchParams.set("limit", String(limit));
  if (isAgendaCollection) {
    fallbackUrl.searchParams.set("sort[]", "data_evento");
    fallbackUrl.searchParams.set("sort[]", "date_created");
  } else {
    fallbackUrl.searchParams.set("sort[]", "sort");
    fallbackUrl.searchParams.set("sort[]", "-date_created");
  }
  fields.forEach((field) => fallbackUrl.searchParams.append("fields[]", field));

  const tryFetch = async (url: URL) => {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Falha ao ler ${collection}`);
    }

    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];

    return data
      .map((entry: Record<string, unknown>) => pickFields(entry, fields))
      .filter(
        (entry: Record<string, unknown>) => Object.keys(entry).length > 0,
      );
  };

  try {
    return await tryFetch(withStatusUrl);
  } catch {
    return await tryFetch(fallbackUrl);
  }
}

function extractAgentAnswer(rawText: string) {
  if (!rawText) {
    return "Não foi possível gerar resposta neste momento.";
  }

  try {
    const parsed = JSON.parse(rawText);
    const directValue =
      parsed?.message ||
      parsed?.response ||
      parsed?.answer ||
      parsed?.output ||
      parsed?.data?.message ||
      parsed?.data?.response;

    if (typeof directValue === "string" && directValue.trim()) {
      return directValue.trim();
    }
  } catch {
    // resposta pode vir em stream/texto
  }

  const streamLines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"));

  if (streamLines.length) {
    let accumulator = "";

    streamLines.forEach((line) => {
      const payload = line.replace(/^data:\s*/, "").trim();

      if (!payload || payload === "[DONE]") {
        return;
      }

      try {
        const parsed = JSON.parse(payload);

        if (parsed?.type === "start" || parsed?.type === "end") {
          return;
        }

        const chunk =
          parsed?.delta?.content ||
          parsed?.token ||
          (parsed?.type === "token" ? parsed?.content : "") ||
          (parsed?.type === "message" ? parsed?.message : "") ||
          (parsed?.type === "response" ? parsed?.response : "");

        if (typeof chunk === "string") {
          accumulator += chunk;
        }
      } catch {
        if (!payload.includes('"run_id"')) {
          accumulator += `${payload} `;
        }
      }
    });

    if (accumulator.trim()) {
      return sanitizeAnswerText(accumulator);
    }
  }

  const concatenatedObjects = extractConcatenatedJsonObjects(rawText);

  if (concatenatedObjects.length) {
    let accumulator = "";

    concatenatedObjects.forEach((entry) => {
      if (entry?.type === "start" || entry?.type === "end") {
        return;
      }

      const chunk =
        entry?.delta?.content ||
        entry?.token ||
        (entry?.type === "token" ? entry?.content : "") ||
        (entry?.type === "message" ? entry?.message : "") ||
        (entry?.type === "response" ? entry?.response : "");

      if (typeof chunk === "string") {
        accumulator += chunk;
      }
    });

    if (accumulator.trim()) {
      return sanitizeAnswerText(accumulator);
    }
  }

  return sanitizeAnswerText(rawText.slice(0, 3500).trim());
}

function sanitizeAnswerText(text: string) {
  const cleaned = String(text || "")
    .replace(/\bProcessing\b/gi, "")
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      "",
    )
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  return cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .trim();
}

function parseEventDate(value: unknown) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const parsedDate = new Date(text);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function extractNextEvent(
  contextResults: PublicCollectionSummary[],
): ParsedEvent | null {
  const agendaCollection = contextResults.find(
    (entry) => entry.collection === "agenda",
  );

  if (!agendaCollection?.items?.length) {
    return null;
  }

  const now = new Date();

  const futureEvents = agendaCollection.items
    .map((item) => {
      const parsedDate = parseEventDate(item?.data_evento);

      if (!parsedDate || parsedDate < now) {
        return null;
      }

      return {
        parsedDate,
        item,
      };
    })
    .filter(
      (entry): entry is { parsedDate: Date; item: Record<string, unknown> } =>
        Boolean(entry),
    )
    .sort(
      (left, right) => left.parsedDate.getTime() - right.parsedDate.getTime(),
    );

  const next = futureEvents[0];

  if (!next) {
    return null;
  }

  return {
    titulo: String(next.item?.titulo || "").trim(),
    dataEvento: next.parsedDate.toISOString(),
    tipo: String(next.item?.tipo || "").trim(),
    sala: String(next.item?.sala || "").trim(),
  };
}

function isNextEventQuestion(message: string) {
  const normalized = normalizeIntentText(message);
  return (
    normalized.includes("proximo evento") ||
    normalized.includes("proxima atividade") ||
    (normalized.includes("qual") &&
      normalized.includes("evento") &&
      normalized.includes("proximo")) ||
    (normalized.includes("evento") &&
      normalized.includes("prox") &&
      normalized.includes("imo"))
  );
}

function normalizeIntentText(message: string) {
  const source = String(message || "");

  let recovered = source;
  try {
    const converted = Buffer.from(source, "latin1").toString("utf8");
    if (converted && converted !== source) {
      recovered = converted;
    }
  } catch {
    recovered = source;
  }

  return recovered
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatDateTimePt(isoDate: string) {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Lisbon",
  }).format(date);
}

function buildNextEventAnswer(nextEvent: ParsedEvent | null) {
  if (!nextEvent) {
    return "Neste momento não encontrei eventos futuros publicados na agenda.";
  }

  const formattedDate = formatDateTimePt(nextEvent.dataEvento);
  const titlePart = nextEvent.titulo
    ? `O próximo evento é ${nextEvent.titulo}`
    : "O próximo evento já publicado";
  const typePart = nextEvent.tipo ? ` (${nextEvent.tipo})` : "";
  const roomPart = nextEvent.sala ? `, na sala ${nextEvent.sala}` : "";

  return `${titlePart}${typePart}, marcado para ${formattedDate}${roomPart}.`;
}

function isPresidentQuestion(message: string) {
  const normalized = normalizeIntentText(message);
  return normalized.includes("presidente") && normalized.includes("nucleo");
}

function isObjectiveQuestion(message: string) {
  const normalized = normalizeIntentText(message);
  return (
    normalized.includes("objetivo") ||
    normalized.includes("missao") ||
    normalized.includes("proposito")
  );
}

function parseAcademicYearStart(value: unknown) {
  const text = String(value || "");
  const match = text.match(/(19|20)\d{2}/);
  if (!match) {
    return 0;
  }

  return Number(match[0]);
}

function extractPresident(contextResults: PublicCollectionSummary[]) {
  const orgaosCollection = contextResults.find(
    (entry) => entry.collection === "orgaos",
  );

  if (!orgaosCollection?.items?.length) {
    return null;
  }

  const candidates = orgaosCollection.items
    .filter((item) => /president/i.test(String(item?.cargo || "")))
    .sort(
      (left, right) =>
        parseAcademicYearStart(right?.ano_letivo) -
        parseAcademicYearStart(left?.ano_letivo),
    );

  const selected = candidates[0];
  if (!selected) {
    return null;
  }

  return {
    nome: String(selected?.nome || "").trim(),
    cargo: String(selected?.cargo || "").trim(),
    anoLetivo: String(selected?.ano_letivo || "").trim(),
  };
}

function buildPresidentAnswer(contextResults: PublicCollectionSummary[]) {
  const president = extractPresident(contextResults);

  if (!president || !president.nome) {
    return "Neste momento não encontrei o presidente do núcleo nos dados públicos.";
  }

  const rolePart = president.cargo ? ` (${president.cargo})` : "";
  const yearPart = president.anoLetivo
    ? ` no ano letivo ${president.anoLetivo}`
    : "";

  return `O presidente do núcleo é ${president.nome}${rolePart}${yearPart}.`;
}

function extractObjective(contextResults: PublicCollectionSummary[]) {
  const sobreCollection = contextResults.find(
    (entry) => entry.collection === "sobre",
  );

  if (!sobreCollection?.items?.length) {
    return "";
  }

  const firstText = String(sobreCollection.items[0]?.texto_sobre || "").trim();
  return toPlainText(firstText);
}

function buildObjectiveAnswer(contextResults: PublicCollectionSummary[]) {
  const objectiveText = extractObjective(contextResults);

  if (!objectiveText) {
    return "Neste momento não encontrei a descrição de objetivo do núcleo nos dados públicos.";
  }

  return `Segundo a informação pública do NeTDW, ${objectiveText}`;
}

function buildContextText(contextPayload: ContextPayload) {
  const parts: string[] = [];

  parts.push(`Fonte: ${contextPayload.source}`);
  parts.push(`Gerado em: ${contextPayload.generatedAt}`);

  if (contextPayload.nextEvent) {
    parts.push(
      `Próximo evento: ${contextPayload.nextEvent.titulo || "Sem título"} | ${contextPayload.nextEvent.dataEvento} | ${contextPayload.nextEvent.tipo || ""} | ${contextPayload.nextEvent.sala || ""}`,
    );
  }

  contextPayload.collections.forEach((collectionEntry) => {
    parts.push(
      `Coleção ${collectionEntry.collection} (${collectionEntry.totalItems} itens): ${JSON.stringify(collectionEntry.items)}`,
    );
  });

  return parts.join("\n").slice(0, 18000);
}

function buildMessageWithContext(
  userMessage: string,
  contextPayload: ContextPayload,
) {
  const contextText = buildContextText(contextPayload);

  return [
    "Contexto do NeTDW para responderes à pergunta.",
    "Usa apenas os dados deste contexto e evita respostas genéricas.",
    contextText,
    `Pergunta do utilizador: ${userMessage}`,
  ].join("\n\n");
}

function extractConcatenatedJsonObjects(rawText: string) {
  const parsedObjects: Array<Record<string, any>> = [];
  let buffer = "";
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (const character of rawText) {
    if (depth > 0 || character === "{") {
      buffer += character;
    }

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (character === "\\") {
        escaping = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed && typeof parsed === "object") {
            parsedObjects.push(parsed as Record<string, any>);
          }
        } catch {
          // ignora blocos inválidos
        }

        buffer = "";
      }
    }
  }

  return parsedObjects;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  const message = String(body?.message || "").trim();
  const threadId = String(
    body?.threadId || config.iaeduDefaultThreadId || "netdw-thread",
  ).trim();

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Mensagem em falta.",
    });
  }

  const directusUrl = String(config.directusUrl || "").replace(/\/$/, "");
  const directusToken = String(config.directusToken || "").trim();
  const iaEndpoint = String(config.iaeduApiEndpoint || "").trim();
  const iaApiKey = String(config.iaeduApiKey || "").trim();
  const iaChannelId = String(config.iaeduChannelId || "").trim();

  if (!directusUrl || !iaEndpoint || !iaApiKey || !iaChannelId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Configuração do chatbot em falta no servidor.",
    });
  }

  const collectionConfigs = [
    {
      collection: "hero_section",
      fields: ["title", "subtitle", "description"],
    },
    { collection: "highlights", fields: ["title", "text"] },
    { collection: "pelouros", fields: ["titulo", "desc"] },
    {
      collection: "agenda",
      fields: ["titulo", "texto", "data_evento", "tipo", "sala"],
    },
    { collection: "noticias", fields: ["titulo", "conteudo", "date_created"] },
    { collection: "sobre", fields: ["titulo_sobre", "texto_sobre"] },
    { collection: "orgaos", fields: ["nome", "cargo", "funcao", "ano_letivo"] },
  ];

  const contextResults: PublicCollectionSummary[] = [];

  for (const configItem of collectionConfigs) {
    try {
      const items = await readCollection(
        directusUrl,
        configItem.collection,
        configItem.fields,
        configItem.collection === "agenda" ? 25 : 10,
        directusToken,
      );

      contextResults.push({
        collection: configItem.collection,
        items,
      });
    } catch {
      continue;
    }
  }

  const contextPayload = {
    source: "NeTDW Directus public collections",
    generatedAt: new Date().toISOString(),
    assistantRules:
      "Responde com base no contexto do NeTDW. Se existir nextEvent, usa esse evento quando perguntarem pelo próximo evento.",
    nextEvent: extractNextEvent(contextResults),
    collections: contextResults.map((entry) => ({
      collection: entry.collection,
      totalItems: entry.items.length,
      items: entry.items.map((item) => {
        const transformed: Record<string, unknown> = {};

        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === "string") {
            transformed[key] = toPlainText(value);
          } else {
            transformed[key] = value;
          }
        });

        return transformed;
      }),
    })),
  } as ContextPayload;

  const nextEvent = extractNextEvent(contextResults);

  contextPayload.nextEvent = nextEvent;

  if (isNextEventQuestion(message)) {
    return {
      ok: true,
      answer: buildNextEventAnswer(nextEvent),
      threadId,
    };
  }

  if (isPresidentQuestion(message)) {
    return {
      ok: true,
      answer: buildPresidentAnswer(contextResults),
      threadId,
    };
  }

  if (isObjectiveQuestion(message)) {
    return {
      ok: true,
      answer: buildObjectiveAnswer(contextResults),
      threadId,
    };
  }

  const messageWithContext = buildMessageWithContext(message, contextPayload);

  const formData = new FormData();
  formData.append("channel_id", iaChannelId);
  formData.append("thread_id", threadId);
  formData.append("user_info", "{}");
  formData.append("message", messageWithContext);
  formData.append("user_context", JSON.stringify(contextPayload));
  formData.append("context", JSON.stringify(contextPayload));

  const response = await fetch(iaEndpoint, {
    method: "POST",
    headers: {
      "x-api-key": iaApiKey,
    },
    body: formData,
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw createError({
      statusCode: response.status || 500,
      statusMessage:
        rawText || "Não foi possível obter resposta do assistente IA.",
    });
  }

  return {
    ok: true,
    answer: extractAgentAnswer(rawText),
    threadId,
  };
});
