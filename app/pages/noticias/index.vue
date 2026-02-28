<script>
import { createDirectus, rest, readItems } from "@directus/sdk";
import { useGlobalLoading } from "../../composables/useGlobalLoading";

const urlDirectus = "https://api.netdw.tech";
const directus = createDirectus(urlDirectus).with(rest());

export default defineNuxtComponent({
  data() {
    return {
      noticias: [],
      isLoading: true,
      errorMessage: "",
      skeletonCount: 9,
    };
  },
  created() {
    this.fetchNoticias();
  },
  methods: {
    async fetchNoticias() {
      this.isLoading = true;
      this.errorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const resultado = await directus.request(
          readItems("noticias", {
            sort: ["-date_created"],
            limit: 24,
          }),
        );

        this.noticias = Array.isArray(resultado) ? resultado : [];
      } catch (error) {
        this.errorMessage = "Não foi possível carregar as notícias.";
      } finally {
        this.isLoading = false;
        stopLoading();
      }
    },
    getImageUrl(fileId) {
      if (!fileId) {
        return "https://via.placeholder.com/1200x700?text=NeTDW";
      }

      return `${urlDirectus}/assets/${fileId}`;
    },
    createExcerpt(content) {
      const plainText = this.decodeHtmlEntities(
        String(content || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      );

      if (!plainText) {
        return "Consulta a notícia completa para mais detalhes.";
      }

      return plainText.length > 170
        ? `${plainText.slice(0, 167)}...`
        : plainText;
    },
    decodeHtmlEntities(text) {
      const map = {
        "&nbsp;": " ",
        "&amp;": "&",
        "&quot;": '"',
        "&#39;": "'",
        "&lt;": "<",
        "&gt;": ">",
        "&aacute;": "á",
        "&agrave;": "à",
        "&acirc;": "â",
        "&atilde;": "ã",
        "&ccedil;": "ç",
        "&eacute;": "é",
        "&ecirc;": "ê",
        "&iacute;": "í",
        "&oacute;": "ó",
        "&ocirc;": "ô",
        "&otilde;": "õ",
        "&uacute;": "ú",
      };

      return Object.keys(map).reduce((result, key) => {
        return result.replaceAll(key, map[key]);
      }, text);
    },
    formatDate(dateValue) {
      if (!dateValue) {
        return "Sem data";
      }

      const date = new Date(dateValue);
      return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Notícias</p>
    <h1>Todas as notícias</h1>

    <p v-if="errorMessage" class="state-message error">
      {{ errorMessage }}
    </p>

    <DirectusSkeleton
      v-else-if="isLoading"
      variant="news-cards"
      :count="skeletonCount"
    />

    <div v-else-if="noticias.length" class="grid">
      <article v-for="item in noticias" :key="item.id" class="card">
        <img
          :src="getImageUrl(item.capa)"
          :alt="`Capa da notícia ${item.titulo}`"
        />
        <div class="card-content">
          <p class="date">{{ formatDate(item.date_created) }}</p>
          <h2>{{ item.titulo }}</h2>
          <p>{{ createExcerpt(item.conteudo) }}</p>
          <NuxtLink class="link" :to="`/noticias/${item.id}`"
            >Ler notícia</NuxtLink
          >
        </div>
      </article>
    </div>

    <p v-else class="state-message">Ainda não existem notícias publicadas.</p>
  </section>
</template>

<style scoped>
.container {
  width: min(1120px, 92%);
  margin: 0 auto;
}

.page-section {
  padding: 3.4rem 0;
}

.kicker {
  margin: 0;
  color: #8baeff;
  font-weight: 600;
}

h1 {
  margin: 0.6rem 0 1.2rem;
  font-size: clamp(1.9rem, 3.8vw, 2.7rem);
}

.state-message {
  margin: 0;
  color: #dde7fb;
}

.state-message.error {
  color: #ffc6c6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.card {
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
  overflow: hidden;
}

.card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 1rem;
}

.date {
  margin: 0;
  color: #96ade4;
  font-size: 0.84rem;
}

h2 {
  margin: 0.55rem 0 0.7rem;
  font-size: 1.08rem;
  line-height: 1.25;
}

.card p {
  margin: 0;
  color: #c7d8fb;
  line-height: 1.55;
}

.link {
  margin-top: 0.8rem;
  display: inline-block;
  border-radius: 0.5rem;
  background: #84a8ff;
  color: #081229;
  font-weight: 600;
  padding: 0.54rem 0.82rem;
  text-decoration: none;
  transition:
    box-shadow 0.22s ease,
    filter 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease;
}

.link:hover {
  box-shadow: 0 9px 18px rgba(30, 68, 145, 0.3);
  filter: brightness(1.03);
  background: #95b6ff;
}

.link:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
