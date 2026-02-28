<script>
import { readFromCollections, pickFirstValue } from "../utils/directus-content";
import { useGlobalLoading } from "../composables/useGlobalLoading";

export default defineNuxtComponent({
  data() {
    return {
      isLoading: true,
      errorMessage: "",
      skeletonCount: 6,
      pelouros: [],
    };
  },
  created() {
    this.fetchPelouros();
  },
  methods: {
    async fetchPelouros() {
      this.isLoading = true;
      this.errorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const { items } = await readFromCollections(["pelouros", "pelouro"], {
          limit: 24,
          sort: ["sort", "-date_created"],
        });

        this.pelouros = items.map((item) => {
          return {
            title: pickFirstValue(
              item,
              ["titulo", "title", "nome", "name"],
              "Pelouro",
            ),
            textHtml: pickFirstValue(
              item,
              [
                "desc",
                "texto",
                "descricao",
                "description",
                "conteudo",
                "content",
              ],
              "",
            ),
          };
        });
      } catch (error) {
        this.errorMessage =
          "Não foi possível carregar os pelouros do Directus.";
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
    <p class="kicker">Pelouros</p>
    <h1>Áreas de atuação</h1>

    <p v-if="errorMessage" class="status-message">{{ errorMessage }}</p>

    <DirectusSkeleton v-if="isLoading" variant="cards" :count="skeletonCount" />

    <p v-else-if="!pelouros.length" class="status-message">
      Ainda não existem pelouros publicados.
    </p>

    <div v-else class="grid">
      <article v-for="item in pelouros" :key="item.title" class="card">
        <h2>{{ item.title }}</h2>
        <div class="card-text" v-html="item.textHtml"></div>
      </article>
    </div>
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

.status-message {
  color: #c9d8f8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.card {
  padding: 1rem;
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
}

.card h2 {
  margin: 0;
  font-size: 1.06rem;
}

.card-text {
  margin-top: 0.7rem;
  color: #c9d8f8;
  line-height: 1.5;
}

.card-text :deep(p) {
  margin: 0 0 0.7rem;
}

.card-text :deep(p:last-child) {
  margin-bottom: 0;
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
