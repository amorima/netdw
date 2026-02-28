<script>
import {
  readFromCollections,
  pickFirstValue,
  stripHtml,
} from "../utils/directus-content";
import { useGlobalLoading } from "../composables/useGlobalLoading";

export default defineNuxtComponent({
  data() {
    return {
      isLoading: true,
      errorMessage: "",
      content: {
        title: "Quem somos",
        paragraph1:
          "O NeTDW é o núcleo de estudantes de Tecnologias e Desenvolvimento Web, orientado para representação estudantil, dinamização de atividades e valorização do percurso académico dos estudantes do curso.",
        paragraph2:
          "Esta página é independente e vai receber conteúdos do Directus assim que forem publicados no teu backend.",
      },
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
        const { items } = await readFromCollections(
          ["sobre_netdw", "sobre", "paginas_sobre"],
          { limit: 1 },
        );

        if (items.length) {
          const firstItem = items[0];

          this.content = {
            title: pickFirstValue(
              firstItem,
              ["titulo", "title"],
              this.content.title,
            ),
            paragraph1: pickFirstValue(
              firstItem,
              ["resumo", "descricao", "description", "conteudo"],
              this.content.paragraph1,
            ),
            paragraph2: pickFirstValue(
              firstItem,
              ["detalhe", "detalhes", "texto", "content"],
              this.content.paragraph2,
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
    cleanText(value) {
      return stripHtml(value);
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Sobre NeTDW</p>
    <h1 v-if="!isLoading">{{ content.title }}</h1>

    <p v-if="errorMessage">{{ errorMessage }}</p>

    <DirectusSkeleton v-else-if="isLoading" variant="text" />

    <template v-else>
      <p>{{ cleanText(content.paragraph1) }}</p>
      <p>{{ cleanText(content.paragraph2) }}</p>
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
</style>
