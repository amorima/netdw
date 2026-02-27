<script>
import { createDirectus, rest, readItems } from "@directus/sdk";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const urlDirectus = "https://api.netdw.tech";
const directus = createDirectus(urlDirectus).with(rest());

export default defineNuxtComponent({
  data() {
    return {
      noticias: [],
      isLoading: true,
      errorMessage: "",
      highlights: [
        {
          title: "Projetos e workshops",
          text: "Iniciativas práticas para reforçar competências técnicas e colaboração.",
        },
        {
          title: "Representação estudantil",
          text: "Acompanhamos o percurso académico e aproximamos estudantes e curso.",
        },
        {
          title: "Ligação à indústria",
          text: "Pontes com empresas, eventos e oportunidades ligadas ao desenvolvimento web.",
        },
      ],
      pelourosPreview: [
        {
          title: "Formação",
          text: "Sessões técnicas e partilha de boas práticas de desenvolvimento web.",
        },
        {
          title: "Eventos",
          text: "Organização de talks, meetups e atividades abertas à comunidade.",
        },
        {
          title: "Comunicação",
          text: "Divulgação de notícias, oportunidades e projetos do núcleo.",
        },
        {
          title: "Parcerias",
          text: "Contacto com entidades externas para apoiar iniciativas e carreira.",
        },
      ],
      proximosEventos: [
        {
          title: "Sessão de Onboarding",
          date: "Março",
          text: "Apresentação do núcleo e das oportunidades para novos membros.",
        },
        {
          title: "Workshop Frontend",
          date: "Abril",
          text: "Workshop prático sobre interfaces web e boas práticas de UX/UI.",
        },
        {
          title: "Mesa Redonda Tech",
          date: "Maio",
          text: "Conversa com convidados sobre tendências em desenvolvimento web.",
        },
      ],
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
            limit: 6,
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

      return plainText.length > 150
        ? `${plainText.slice(0, 147)}...`
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
  <div class="container home-page">
    <section class="hero">
      <p class="hero-kicker">
        Núcleo de Estudantes de Tecnologias e Desenvolvimento Web
      </p>
      <h1>
        Comunidade tecnológica para aprender, construir e evoluir em conjunto
      </h1>
      <p class="hero-description">
        O NeTDW reúne estudantes com interesse em desenvolvimento web, promove
        iniciativas práticas e cria pontos de contacto entre academia,
        comunidade e mercado.
      </p>
      <div class="hero-actions">
        <NuxtLink to="/noticias" class="hero-button">Ver notícias</NuxtLink>
        <NuxtLink to="/eventos" class="hero-button secondary"
          >Explorar eventos</NuxtLink
        >
      </div>
    </section>

    <section class="highlights" aria-label="Destaques">
      <article
        v-for="highlight in highlights"
        :key="highlight.title"
        class="highlight-card"
      >
        <h2>{{ highlight.title }}</h2>
        <p>{{ highlight.text }}</p>
      </article>
    </section>

    <section class="pelouros" aria-label="Pelouros">
      <div class="section-header">
        <h2>Pelouros em destaque</h2>
        <p>Áreas de atuação para apoiar estudantes e dinamizar a comunidade</p>
      </div>
      <div class="pelouros-grid">
        <article
          v-for="pelouro in pelourosPreview"
          :key="pelouro.title"
          class="pelouro-card"
        >
          <h3>{{ pelouro.title }}</h3>
          <p>{{ pelouro.text }}</p>
        </article>
      </div>
    </section>

    <section class="events" aria-label="Próximos eventos">
      <div class="section-header">
        <h2>Próximos eventos</h2>
        <p>Atividades planeadas para os próximos meses</p>
      </div>
      <div class="events-grid">
        <article
          v-for="evento in proximosEventos"
          :key="evento.title"
          class="event-card"
        >
          <p class="event-date">{{ evento.date }}</p>
          <h3>{{ evento.title }}</h3>
          <p>{{ evento.text }}</p>
        </article>
      </div>
    </section>

    <section class="news-section" aria-label="Notícias">
      <div class="section-header">
        <h2>Últimas notícias</h2>
      </div>

      <p v-if="errorMessage" class="state-message error">
        {{ errorMessage }}
      </p>

      <div v-else-if="noticias.length" class="news-grid">
        <article v-for="item in noticias" :key="item.id" class="news-card">
          <img
            :src="getImageUrl(item.capa)"
            :alt="`Capa da notícia ${item.titulo}`"
          />
          <div class="news-content">
            <p class="news-date">{{ formatDate(item.date_created) }}</p>
            <h3>{{ item.titulo }}</h3>
            <p>{{ createExcerpt(item.conteudo) }}</p>
            <NuxtLink class="news-button" :to="`/noticias/${item.id}`"
              >Ler notícia</NuxtLink
            >
          </div>
        </article>
      </div>

      <p v-else-if="!isLoading" class="state-message">
        Ainda não existem notícias publicadas.
      </p>
    </section>
  </div>
</template>

<style scoped>
.container {
  width: min(1120px, 92%);
  margin: 0 auto;
}

.home-page {
  padding-top: 2.8rem;
}

.hero {
  padding: 2rem 0 2.8rem;
}

.hero-kicker {
  margin: 0;
  color: #85aaff;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero h1 {
  margin: 0.7rem 0 1rem;
  max-width: 820px;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.07;
}

.hero-description {
  margin: 0;
  max-width: 760px;
  color: #c4d3f7;
  line-height: 1.65;
}

.hero-actions {
  margin-top: 1.7rem;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.hero-button {
  display: inline-block;
  padding: 0.74rem 1.1rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-weight: 600;
  color: #09122a;
  background-color: #84a8ff;
}

.hero-button.secondary {
  color: #dce8ff;
  border: 1px solid #345198;
  background: rgba(20, 33, 66, 0.7);
}

.highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 3.2rem;
}

.highlight-card {
  padding: 1rem;
  border: 1px solid #243968;
  border-radius: 0.85rem;
  background: rgba(11, 19, 39, 0.78);
}

.highlight-card h2 {
  margin: 0;
  font-size: 1.03rem;
}

.highlight-card p {
  margin: 0.8rem 0 0;
  color: #cbd8f7;
  line-height: 1.5;
}

.pelouros,
.events,
.news-section {
  padding-bottom: 3.3rem;
}

.section-header {
  margin-bottom: 1.1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.55rem;
}

.section-header p {
  margin: 0.52rem 0 0;
  color: #b8c9ef;
}

.pelouros-grid,
.events-grid,
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.pelouro-card,
.event-card,
.news-card {
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
}

.pelouro-card,
.event-card {
  padding: 1rem;
}

.pelouro-card h3,
.event-card h3 {
  margin: 0;
  font-size: 1.08rem;
}

.pelouro-card p,
.event-card p {
  margin: 0.75rem 0 0;
  color: #c7d7fa;
  line-height: 1.5;
}

.event-date {
  color: #94aff0;
  margin: 0;
  font-size: 0.86rem;
}

.state-message {
  margin: 0;
  color: #dde7fb;
}

.state-message.error {
  color: #ffc6c6;
}

.news-card {
  overflow: hidden;
}

.news-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.news-content {
  padding: 1rem;
}

.news-date {
  margin: 0;
  color: #96ade4;
  font-size: 0.84rem;
}

.news-content h3 {
  margin: 0.55rem 0 0.7rem;
  font-size: 1.08rem;
  line-height: 1.25;
}

.news-content p {
  margin: 0;
  color: #c7d8fb;
  line-height: 1.55;
}

.news-button {
  margin-top: 0.8rem;
  display: inline-block;
  border: 0;
  border-radius: 0.5rem;
  background: #84a8ff;
  color: #081229;
  font-weight: 600;
  padding: 0.54rem 0.82rem;
  cursor: pointer;
  text-decoration: none;
}

@media (max-width: 960px) {
  .highlights,
  .pelouros-grid,
  .events-grid,
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-page {
    padding-top: 1.8rem;
  }

  .highlights,
  .pelouros-grid,
  .events-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
