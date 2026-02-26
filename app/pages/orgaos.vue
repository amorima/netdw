<script>
import {
  readFromCollections,
  pickFirstValue,
  stripHtml,
} from "../utils/directus-content";

export default defineNuxtComponent({
  data() {
    return {
      isLoading: true,
      errorMessage: "",
      orgaos: [
        {
          title: "Mesa do Núcleo",
          text: "Coordenação geral e representação institucional do NeTDW.",
        },
        {
          title: "Assembleia",
          text: "Espaço de participação dos estudantes e definição de prioridades.",
        },
        {
          title: "Equipas Operacionais",
          text: "Execução de atividades, comunicação e apoio aos projetos do núcleo.",
        },
      ],
    };
  },
  created() {
    this.fetchOrgaos();
  },
  methods: {
    async fetchOrgaos() {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        const { items } = await readFromCollections(
          ["orgaos", "orgaos_sociais"],
          {
            limit: 24,
            sort: ["sort", "-date_created"],
          },
        );

        if (items.length) {
          this.orgaos = items.map((item) => {
            return {
              title: pickFirstValue(
                item,
                ["titulo", "title", "nome", "name"],
                "Órgão",
              ),
              text: stripHtml(
                pickFirstValue(
                  item,
                  ["descricao", "description", "conteudo", "content"],
                  "Conteúdo deste órgão em atualização.",
                ),
              ),
            };
          });
        }
      } catch (error) {
        this.errorMessage = "Não foi possível carregar os órgãos do Directus.";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Órgãos</p>
    <h1>Estrutura organizativa</h1>

    <p v-if="isLoading" class="status-message">A carregar órgãos...</p>
    <p v-else-if="errorMessage" class="status-message">{{ errorMessage }}</p>

    <div class="grid">
      <article v-for="orgao in orgaos" :key="orgao.title" class="card">
        <h2>{{ orgao.title }}</h2>
        <p>{{ orgao.text }}</p>
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

.card p {
  margin: 0.7rem 0 0;
  color: #c9d8f8;
  line-height: 1.5;
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
