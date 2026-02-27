<script>
import { createDirectus, rest, readItems } from "@directus/sdk";
import { pickFirstValue, stripHtml } from "../utils/directus-content";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const urlDirectus = "https://api.netdw.tech";
const directus = createDirectus(urlDirectus).with(rest());

export default defineNuxtComponent({
  data() {
    return {
      isLoading: true,
      errorMessage: "",
      eventos: [],
      tipoLabels: {
        pporto: "P.Porto",
      },
    };
  },
  computed: {
    futureEvents() {
      const now = Date.now();
      return this.eventos.filter(
        (evento) => evento.timestamp !== null && evento.timestamp >= now,
      );
    },
    pastEvents() {
      const now = Date.now();
      return this.eventos
        .filter((evento) => evento.timestamp !== null && evento.timestamp < now)
        .slice(0, 3);
    },
    undatedEvents() {
      return this.eventos.filter((evento) => evento.timestamp === null);
    },
    hasAnyEvents() {
      return this.eventos.length > 0;
    },
  },
  created() {
    this.fetchEventos();
  },
  methods: {
    async fetchEventos() {
      this.isLoading = true;
      this.errorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const items = await directus.request(
          readItems("agenda", {
            sort: ["-date_created"],
            limit: 24,
          }),
        );

        this.eventos = (Array.isArray(items) ? items : []).map((item) => {
          const rawDate = pickFirstValue(
            item,
            ["data_evento", "data", "date", "mes"],
            "",
          );
          const dateInfo = this.parseEventDate(rawDate);
          const rawRoom = item?.sala ?? item?.room ?? item?.local ?? "";
          const sala = String(rawRoom || "").trim();
          const rawType = item?.tipo ?? item?.type ?? "";
          const tipo = this.resolveTipoText(item, rawType);

          return {
            id:
              item.id ||
              `${pickFirstValue(item, ["titulo", "title", "nome", "name"], "evento")}-${rawDate}`,
            titulo: pickFirstValue(
              item,
              ["titulo", "title", "nome", "name"],
              "Evento",
            ),
            data: dateInfo.label,
            timestamp: dateInfo.timestamp,
            tipo,
            sala,
            descricao: stripHtml(
              pickFirstValue(
                item,
                ["texto", "descricao", "description", "conteudo", "content"],
                "Conteúdo deste evento em atualização.",
              ),
            ),
          };
        });
      } catch (error) {
        const details =
          error?.data?.errors?.[0]?.message ||
          error?.statusMessage ||
          error?.message ||
          "Erro desconhecido";

        console.error("Erro Directus (agenda):", error);
        this.errorMessage = `Não foi possível carregar os eventos (${details}).`;
      } finally {
        this.isLoading = false;
        stopLoading();
      }
    },
    parseEventDate(dateValue) {
      if (!dateValue) {
        return {
          label: "Data e hora a anunciar",
          timestamp: null,
        };
      }

      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) {
        return {
          label: String(dateValue),
          timestamp: null,
        };
      }

      return {
        label: new Intl.DateTimeFormat("pt-PT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date),
        timestamp: date.getTime(),
      };
    },
    resolveTipoText(item, rawType) {
      const explicitText = pickFirstValue(
        item,
        ["tipo_text", "tipo_label", "tipo_nome", "type_text", "type_label"],
        "",
      );

      if (explicitText) {
        return explicitText;
      }

      const value = String(rawType || "").trim();
      if (!value) {
        return "";
      }

      const mappedLabel = this.tipoLabels[value.toLowerCase()];
      if (mappedLabel) {
        return mappedLabel;
      }

      const normalized = value
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return normalized
        .split(" ")
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Eventos</p>
    <h1>Agenda do núcleo</h1>

    <p v-if="errorMessage" class="status-message">{{ errorMessage }}</p>
    <p v-else-if="!isLoading && !hasAnyEvents" class="status-message">
      Sem eventos de momento.
    </p>

    <template v-else>
      <div v-if="futureEvents.length" class="section-block">
        <h2 class="section-title">Próximos eventos</h2>
        <div class="grid">
          <article v-for="evento in futureEvents" :key="evento.id" class="card">
            <div v-if="evento.tipo || evento.sala" class="meta-pills">
              <p v-if="evento.tipo" class="tipo-pill">{{ evento.tipo }}</p>
              <p v-if="evento.sala" class="sala-pill">{{ evento.sala }}</p>
            </div>
            <p class="date">{{ evento.data }}</p>
            <h3>{{ evento.titulo }}</h3>
            <p>{{ evento.descricao }}</p>
          </article>
        </div>
      </div>

      <div v-if="undatedEvents.length" class="section-block">
        <h2 class="section-title">Eventos sem data definida</h2>
        <div class="grid">
          <article
            v-for="evento in undatedEvents"
            :key="evento.id"
            class="card"
          >
            <div v-if="evento.tipo || evento.sala" class="meta-pills">
              <p v-if="evento.tipo" class="tipo-pill">{{ evento.tipo }}</p>
              <p v-if="evento.sala" class="sala-pill">{{ evento.sala }}</p>
            </div>
            <p class="date">{{ evento.data }}</p>
            <h3>{{ evento.titulo }}</h3>
            <p>{{ evento.descricao }}</p>
          </article>
        </div>
      </div>

      <div v-if="pastEvents.length" class="section-block">
        <h2 class="section-title">Eventos passados</h2>
        <div class="grid">
          <article v-for="evento in pastEvents" :key="evento.id" class="card">
            <div v-if="evento.tipo || evento.sala" class="meta-pills">
              <p v-if="evento.tipo" class="tipo-pill">{{ evento.tipo }}</p>
              <p v-if="evento.sala" class="sala-pill">{{ evento.sala }}</p>
            </div>
            <p class="date">{{ evento.data }}</p>
            <h3>{{ evento.titulo }}</h3>
            <p>{{ evento.descricao }}</p>
          </article>
        </div>
      </div>
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
  margin: 0.6rem 0 1.2rem;
  font-size: clamp(1.9rem, 3.8vw, 2.7rem);
}

.status-message {
  color: #c9d8f8;
}

.section-block {
  margin-top: 1.2rem;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
  color: #dce7ff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.card {
  position: relative;
  padding: 1rem;
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
}

.meta-pills {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tipo-pill,
.sala-pill {
  margin: 0;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.tipo-pill {
  border: 1px solid #2e4d8f;
  background: rgba(20, 35, 70, 0.62);
  color: #c7d8ff;
}

.sala-pill {
  border: 1px solid #365293;
  background: rgba(25, 41, 78, 0.65);
  color: #bcd2ff;
}

.date {
  margin: 0;
  color: #94aff0;
  font-size: 0.86rem;
}

.card h3 {
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
