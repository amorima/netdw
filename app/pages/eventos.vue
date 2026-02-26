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
      eventos: [
        {
          titulo: "Sessão de Onboarding",
          data: "Março",
          descricao: "Apresentação do núcleo e integração de novos estudantes.",
        },
        {
          titulo: "Workshop Frontend",
          data: "Abril",
          descricao: "Prática de interfaces web com foco em usabilidade.",
        },
        {
          titulo: "Mesa Redonda Tech",
          data: "Maio",
          descricao: "Conversa com convidados sobre tendências do setor.",
        },
      ],
    };
  },
  created() {
    this.fetchEventos();
  },
  methods: {
    async fetchEventos() {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        const { items } = await readFromCollections(["eventos", "evento"], {
          limit: 24,
          sort: ["data", "sort", "-date_created"],
        });

        if (items.length) {
          this.eventos = items.map((item) => {
            const dateLabel = pickFirstValue(
              item,
              ["data", "date", "mes"],
              "Sem data",
            );

            return {
              titulo: pickFirstValue(
                item,
                ["titulo", "title", "nome", "name"],
                "Evento",
              ),
              data: dateLabel,
              descricao: stripHtml(
                pickFirstValue(
                  item,
                  ["descricao", "description", "conteudo", "content"],
                  "Conteúdo deste evento em atualização.",
                ),
              ),
            };
          });
        }
      } catch (error) {
        this.errorMessage = "Não foi possível carregar os eventos do Directus.";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Eventos</p>
    <h1>Agenda do núcleo</h1>

    <p v-if="isLoading" class="status-message">A carregar eventos...</p>
    <p v-else-if="errorMessage" class="status-message">{{ errorMessage }}</p>

    <div class="grid">
      <article v-for="evento in eventos" :key="evento.titulo" class="card">
        <p class="date">{{ evento.data }}</p>
        <h2>{{ evento.titulo }}</h2>
        <p>{{ evento.descricao }}</p>
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

.date {
  margin: 0;
  color: #94aff0;
  font-size: 0.86rem;
}

.card h2 {
  margin: 0.55rem 0 0;
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
