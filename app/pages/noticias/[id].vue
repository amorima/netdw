<script>
import { createDirectus, rest, readItem } from "@directus/sdk";
import { useGlobalLoading } from "../../composables/useGlobalLoading";

const urlDirectus = "https://api.netdw.tech";
const directus = createDirectus(urlDirectus).with(rest());

export default defineNuxtComponent({
  data() {
    return {
      noticia: null,
      isLoading: true,
      errorMessage: "",
    };
  },
  created() {
    this.fetchNoticia();
  },
  watch: {
    "$route.params.id"() {
      this.fetchNoticia();
    },
  },
  methods: {
    async fetchNoticia() {
      this.isLoading = true;
      this.errorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const id = this.$route.params.id;
        this.noticia = await directus.request(readItem("noticias", id));
      } catch (error) {
        this.errorMessage = "Não foi possível carregar esta notícia.";
        this.noticia = null;
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
    <p v-if="errorMessage" class="state-message error">
      {{ errorMessage }}
    </p>

    <article v-else-if="noticia" class="news-detail">
      <p class="date">{{ formatDate(noticia.date_created) }}</p>
      <h1>{{ noticia.titulo }}</h1>
      <img
        :src="getImageUrl(noticia.capa)"
        :alt="`Capa da notícia ${noticia.titulo}`"
      />
      <div class="content" v-html="noticia.conteudo"></div>
      <NuxtLink to="/noticias" class="back-link">Voltar às notícias</NuxtLink>
    </article>

    <p v-else-if="!isLoading" class="state-message">Notícia não encontrada.</p>
  </section>
</template>

<style scoped>
.container {
  width: min(920px, 92%);
  margin: 0 auto;
}

.page-section {
  padding: 3.4rem 0;
}

.state-message {
  margin: 0;
  color: #dde7fb;
}

.state-message.error {
  color: #ffc6c6;
}

.news-detail {
  border: 1px solid #263a67;
  border-radius: 0.95rem;
  background: rgba(10, 17, 35, 0.82);
  padding: 1.2rem;
}

.date {
  margin: 0;
  color: #96ade4;
  font-size: 0.9rem;
}

h1 {
  margin: 0.6rem 0 1.1rem;
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  line-height: 1.16;
}

img {
  width: 100%;
  border-radius: 0.7rem;
  max-height: 420px;
  object-fit: cover;
}

.content {
  margin-top: 1rem;
  color: #d3e0fb;
  line-height: 1.7;
}

.content :deep(p) {
  margin: 0.7rem 0;
}

.back-link {
  margin-top: 1rem;
  display: inline-block;
  border-radius: 0.5rem;
  background: #84a8ff;
  color: #081229;
  font-weight: 600;
  padding: 0.54rem 0.82rem;
  text-decoration: none;
}
</style>
