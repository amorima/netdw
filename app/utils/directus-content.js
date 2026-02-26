import { createDirectus, rest, readItems } from "@directus/sdk";

const directusUrl = "https://api.netdw.tech";
const directus = createDirectus(directusUrl).with(rest());

export async function readFromCollections(collectionNames, query) {
  for (const collection of collectionNames) {
    try {
      const items = await directus.request(readItems(collection, query));

      if (Array.isArray(items)) {
        return { collection, items };
      }
    } catch (error) {
      continue;
    }
  }

  return { collection: null, items: [] };
}

export function pickFirstValue(source, keys, fallbackValue = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallbackValue;
}

export function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
