<script>
import { createDirectus, rest, readItems } from "@directus/sdk";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const urlDirectus = "https://api.netdw.tech";
const directus = createDirectus(urlDirectus).with(rest());

export default defineNuxtComponent({
  data() {
    return {
      noticias: [],
      pelourosPreview: [],
      proximosEventos: [],
      isLoadingNews: true,
      isLoadingPelouros: true,
      isLoadingEventos: true,
      newsErrorMessage: "",
      pelourosErrorMessage: "",
      eventosErrorMessage: "",
      heroSection: null,
      isHeroReady: false,
      newsSkeletonCount: 3,
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
    };
  },
  created() {
    this.fetchHeroSection();
    this.fetchPelourosPreview();
    this.fetchProximosEventos();
    this.fetchNoticias();
  },
  computed: {
    heroBackgroundStyle() {
      if (!this.heroSection) {
        return {};
      }

      const backgroundImageUrl = this.getImageUrl(
        this.heroSection.background_image,
      );

      return {
        "--hero-bg-image": `url("${backgroundImageUrl}")`,
      };
    },
    heroButtons() {
      const buttons = [];

      const firstText = String(this.heroSection.button_1_text || "").trim();
      const firstLink = String(this.heroSection.button_1_link || "").trim();
      if (firstText && firstLink) {
        buttons.push({
          text: firstText,
          link: firstLink,
          variant: "primary",
        });
      }

      const secondText = String(this.heroSection.button_2_text || "").trim();
      const secondLink = String(this.heroSection.button_2_link || "").trim();
      if (secondText && secondLink) {
        buttons.push({
          text: secondText,
          link: secondLink,
          variant: "secondary",
        });
      }

      return buttons;
    },
  },
  methods: {
    async fetchHeroSection() {
      try {
        const resultado = await directus.request(
          readItems("hero_section", {
            filter: {
              status: {
                _eq: "published",
              },
            },
            sort: ["sort", "-date_created"],
            limit: 1,
          }),
        );

        const item = Array.isArray(resultado) ? resultado[0] : null;

        this.heroSection = item || null;
      } catch (error) {
        this.heroSection = null;
      } finally {
        this.isHeroReady = true;
      }
    },
    async fetchNoticias() {
      this.isLoadingNews = true;
      this.newsErrorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const resultado = await directus.request(
          readItems("noticias", {
            sort: ["-date_created"],
            limit: 3,
          }),
        );

        this.noticias = Array.isArray(resultado) ? resultado : [];
      } catch (error) {
        this.newsErrorMessage = "Não foi possível carregar as notícias.";
      } finally {
        this.isLoadingNews = false;
        stopLoading();
      }
    },
    async fetchPelourosPreview() {
      this.isLoadingPelouros = true;
      this.pelourosErrorMessage = "";

      try {
        const resultado = await directus.request(
          readItems("pelouros", {
            filter: {
              status: {
                _eq: "published",
              },
            },
            sort: ["sort", "-date_created"],
            limit: 24,
          }),
        );

        const allPelouros = (Array.isArray(resultado) ? resultado : []).map(
          (item) => ({
            id: item.id,
            title: String(item.titulo || item.title || item.nome || "Pelouro"),
            text: this.createExcerpt(
              item.desc ||
                item.texto ||
                item.descricao ||
                item.description ||
                item.conteudo ||
                "",
            ),
          }),
        );

        this.pelourosPreview = this.pickRandomItems(allPelouros, 3);
      } catch (error) {
        this.pelourosErrorMessage =
          "Não foi possível carregar os pelouros em destaque.";
      } finally {
        this.isLoadingPelouros = false;
      }
    },
    async fetchProximosEventos() {
      this.isLoadingEventos = true;
      this.eventosErrorMessage = "";

      try {
        const resultado = await directus.request(
          readItems("agenda", {
            filter: {
              status: {
                _eq: "published",
              },
            },
            sort: ["data_evento", "sort", "-date_created"],
            limit: 48,
          }),
        );

        const now = Date.now();
        const parsedEvents = (Array.isArray(resultado) ? resultado : [])
          .map((item) => {
            const rawDate =
              item.data_evento || item.data || item.date || item.mes || "";
            const date = new Date(rawDate);
            const timestamp = Number.isNaN(date.getTime())
              ? null
              : date.getTime();

            return {
              id: item.id,
              title: String(item.titulo || item.title || item.nome || "Evento"),
              timestamp,
              dateLabel: this.formatDate(rawDate),
              text: this.createExcerpt(
                item.texto ||
                  item.descricao ||
                  item.description ||
                  item.conteudo ||
                  item.content ||
                  "",
              ),
            };
          })
          .filter((item) => item.timestamp !== null && item.timestamp >= now)
          .sort(
            (firstItem, secondItem) =>
              firstItem.timestamp - secondItem.timestamp,
          )
          .slice(0, 3);

        this.proximosEventos = parsedEvents;
      } catch (error) {
        this.eventosErrorMessage =
          "Não foi possível carregar os próximos eventos.";
      } finally {
        this.isLoadingEventos = false;
      }
    },
    pickRandomItems(items, count) {
      const copy = [...items];

      for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
      }

      return copy.slice(0, count);
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
    isExternalLink(link) {
      return /^https?:\/\//i.test(String(link || "").trim());
    },
  },
});
</script>

<template>
  <div class="container home-page">
    <section
      v-if="isHeroReady && heroSection"
      class="hero"
      :style="heroBackgroundStyle"
      aria-label="Destaque principal"
    >
      <div class="hero-content">
        <p v-if="heroSection.subtitle" class="hero-kicker">
          {{ heroSection.subtitle }}
        </p>

        <h1 class="font-neiko">{{ heroSection.title }}</h1>

        <p v-if="heroSection.description" class="hero-description">
          {{ heroSection.description }}
        </p>

        <div v-if="heroButtons.length" class="hero-actions">
          <template
            v-for="button in heroButtons"
            :key="`${button.text}-${button.link}`"
          >
            <a
              v-if="isExternalLink(button.link)"
              :href="button.link"
              class="hero-button"
              :class="{ secondary: button.variant === 'secondary' }"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ button.text }}
            </a>

            <NuxtLink
              v-else
              :to="button.link"
              class="hero-button"
              :class="{ secondary: button.variant === 'secondary' }"
            >
              {{ button.text }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <DirectusSkeleton v-else-if="!isHeroReady" variant="hero" />

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
        <div class="section-top">
          <h2>Pelouros em destaque</h2>
          <NuxtLink class="section-link" to="/pelouros">Ler mais</NuxtLink>
        </div>
        <p>Áreas de atuação para apoiar estudantes e dinamizar a comunidade</p>
      </div>

      <p v-if="pelourosErrorMessage" class="state-message error">
        {{ pelourosErrorMessage }}
      </p>

      <DirectusSkeleton
        v-else-if="isLoadingPelouros"
        variant="cards"
        :count="3"
      />

      <div v-else-if="pelourosPreview.length" class="pelouros-grid">
        <article
          v-for="pelouro in pelourosPreview"
          :key="pelouro.id || pelouro.title"
          class="pelouro-card"
        >
          <h3>{{ pelouro.title }}</h3>
          <p>{{ pelouro.text }}</p>
        </article>
      </div>

      <p v-else class="state-message">
        Ainda não existem pelouros ativos publicados.
      </p>
    </section>

    <section class="events" aria-label="Próximos eventos">
      <div class="section-header">
        <div class="section-top">
          <h2>Próximos eventos</h2>
          <NuxtLink class="section-link" to="/eventos">Ler mais</NuxtLink>
        </div>
        <p>Atividades planeadas para os próximos meses</p>
      </div>

      <p v-if="eventosErrorMessage" class="state-message error">
        {{ eventosErrorMessage }}
      </p>

      <DirectusSkeleton
        v-else-if="isLoadingEventos"
        variant="cards"
        :count="3"
      />

      <div v-else-if="proximosEventos.length" class="events-grid">
        <article
          v-for="evento in proximosEventos"
          :key="evento.id || evento.title"
          class="event-card"
        >
          <p class="event-date">{{ evento.dateLabel }}</p>
          <h3>{{ evento.title }}</h3>
          <p>{{ evento.text }}</p>
        </article>
      </div>

      <p v-else class="state-message">
        Ainda não existem próximos eventos publicados.
      </p>
    </section>

    <section class="news-section" aria-label="Notícias">
      <div class="section-header">
        <div class="section-top">
          <h2>Últimas notícias</h2>
          <NuxtLink class="section-link" to="/noticias">Ler mais</NuxtLink>
        </div>
      </div>

      <p v-if="newsErrorMessage" class="state-message error">
        {{ newsErrorMessage }}
      </p>

      <DirectusSkeleton
        v-else-if="isLoadingNews"
        variant="news-cards"
        :count="newsSkeletonCount"
      />

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

      <p v-else-if="!isLoadingNews" class="state-message">
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
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(121, 157, 235, 0.48);
  border-radius: 1rem;
  margin-bottom: 1rem;
  padding: 2.4rem;
  min-height: 360px;
  display: flex;
  align-items: center;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.32);
}

.hero::before {
  content: "";
  position: absolute;
  inset: -18px;
  z-index: 0;
  background-image: var(--hero-bg-image);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: scale(1.03);
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(rgba(8, 24, 54, 0.7), rgba(10, 31, 67, 0.66));
}

.hero-content {
  width: min(760px, 100%);
  position: relative;
  z-index: 1;
}

.hero-kicker {
  margin: 0;
  color: #d9e8ff;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0.7rem 0 1rem;
  max-width: 820px;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.08;
  letter-spacing: 0.018em;
  color: #fff;
  text-wrap: balance;
}

.hero-description {
  margin: 0;
  max-width: 640px;
  color: #d7e6ff;
  line-height: 1.65;
  font-size: clamp(0.98rem, 1.7vw, 1.1rem);
}

.hero-actions {
  margin-top: 1.7rem;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.hero-button {
  display: inline-block;
  padding: 0.74rem 1.2rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-weight: 600;
  color: #06142c;
  background-color: #c9dcff;
  border: 1px solid #a9c6ff;
  transition:
    box-shadow 0.22s ease,
    filter 0.22s ease,
    color 0.22s ease,
    background-color 0.22s ease,
    border-color 0.22s ease;
}

.hero-button.secondary {
  color: #eaf2ff;
  border: 1px solid rgba(180, 204, 255, 0.72);
  background: rgba(22, 47, 96, 0.48);
}

.hero-button:hover {
  box-shadow: 0 10px 22px rgba(8, 25, 56, 0.34);
  filter: brightness(1.03);
  background-color: #d8e6ff;
  border-color: #c6dbff;
}

.hero-button.secondary:hover {
  background: rgba(35, 68, 131, 0.56);
  border-color: rgba(209, 224, 255, 0.88);
  box-shadow: 0 10px 22px rgba(8, 25, 56, 0.34);
  filter: brightness(1.03);
}

.hero-button:focus-visible {
  outline: 2px solid #d6e6ff;
  outline-offset: 2px;
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

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.8rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.55rem;
}

.section-link {
  color: rgba(191, 210, 245, 0.82);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  line-height: 1;
  border-bottom: 1px solid transparent;
  transition:
    color 0.22s ease,
    border-color 0.22s ease;
}

.section-link:hover {
  color: #dce9ff;
  border-color: rgba(220, 233, 255, 0.5);
}

.section-link:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
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
  transition:
    box-shadow 0.22s ease,
    filter 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease;
}

.news-button:hover {
  box-shadow: 0 9px 18px rgba(30, 68, 145, 0.3);
  filter: brightness(1.03);
  background: #95b6ff;
}

.news-button:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
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

  .hero {
    padding: 1.6rem 1.15rem;
    min-height: 320px;
  }

  .highlights,
  .pelouros-grid,
  .events-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }

  .section-top {
    align-items: center;
    gap: 0.55rem;
  }
}
</style>
