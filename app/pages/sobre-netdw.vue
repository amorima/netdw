<script>
import { readFromCollections, pickFirstValue } from "../utils/directus-content";
import { useGlobalLoading } from "../composables/useGlobalLoading";

export default defineNuxtComponent({
  data() {
    return {
      isLoading: true,
      errorMessage: "",
      content: null,
    };
  },
  created() {
    this.fetchSobreContent();
  },
  methods: {
    async fetchSobreContent() {
      this.isLoading = true;
      this.errorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const { items } = await readFromCollections(["sobre"], {
          limit: 1,
          sort: ["sort", "-date_created"],
        });

        if (items.length) {
          const firstItem = items[0];

          this.content = {
            title: pickFirstValue(
              firstItem,
              ["titulo_sobre", "titulo", "title"],
              "",
            ),
            body: pickFirstValue(
              firstItem,
              ["texto_sobre", "texto", "content"],
              "",
            ),
          };
        }
      } catch (error) {
        this.errorMessage =
          "Não foi possível carregar os conteúdos do Directus.";
      } finally {
        this.isLoading = false;
        stopLoading();
      }
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Sobre NeTDW</p>

    <p v-if="errorMessage">{{ errorMessage }}</p>

    <DirectusSkeleton v-else-if="isLoading" variant="sobre" />

    <p
      v-else-if="!content || (!content.title && !content.body)"
      class="status-message"
    >
      Ainda não existe conteúdo publicado na coleção sobre.
    </p>

    <template v-else>
      <h1>{{ content.title }}</h1>
      <div class="about-content" v-html="content.body"></div>
    </template>
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
  margin: 0.6rem 0 1rem;
  font-size: clamp(1.9rem, 3.8vw, 2.7rem);
}

p {
  max-width: 780px;
  color: #c9d8f8;
  line-height: 1.65;
}

.status-message {
  color: #c9d8f8;
}

.about-content {
  max-width: 780px;
  color: #c9d8f8;
  line-height: 1.65;
}

.about-content :deep(p) {
  margin: 0 0 1rem;
}

.about-content :deep(img) {
  display: block;
  max-width: min(100%, 720px);
  max-height: 420px;
  width: auto;
  height: auto;
  border-radius: 0.55rem;
  margin: 0.75rem 0 1rem;
  object-fit: cover;
}
</style>
