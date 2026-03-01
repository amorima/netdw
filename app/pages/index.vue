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
      isLoadingHighlights: true,
      isLoadingPelouros: true,
      isLoadingEventos: true,
      newsErrorMessage: "",
      highlightsErrorMessage: "",
      pelourosErrorMessage: "",
      eventosErrorMessage: "",
      isSignupModalOpen: false,
      signupFormData: {
        nome: "",
        email: "",
        numeroEstudante: "",
        anoCurricular: "",
        pelouro: "membro",
        company: "",
      },
      signupError: "",
      signupSuccess: "",
      isSubmittingSignup: false,
      signupFormStartedAt: Date.now(),
      anoCurricularOptions: ["1º Ano", "2º Ano", "3º Ano"],
      pelouroOptions: ["membro"],
      heroSection: null,
      isHeroReady: false,
      newsSkeletonCount: 3,
      highlights: [],
    };
  },
  created() {
    this.fetchHeroSection();
    this.fetchHighlights();
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
    async fetchHighlights() {
      this.isLoadingHighlights = true;
      this.highlightsErrorMessage = "";

      try {
        const resultado = await directus.request(
          readItems("highlights", {
            filter: {
              status: {
                _eq: "published",
              },
            },
            sort: ["sort", "-date_created"],
            limit: 12,
          }),
        );

        this.highlights = (Array.isArray(resultado) ? resultado : []).map(
          (item) => ({
            id: item.id,
            title: String(item.title || item.titulo || "Destaque"),
            text: this.createExcerpt(
              item.text || item.texto || item.desc || "",
            ),
          }),
        );
      } catch (error) {
        this.highlightsErrorMessage = "Não foi possível carregar os destaques.";
      } finally {
        this.isLoadingHighlights = false;
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
    openSignupModal() {
      this.signupError = "";
      this.signupSuccess = "";
      this.signupFormStartedAt = Date.now();
      this.isSignupModalOpen = true;
    },
    closeSignupModal() {
      this.isSignupModalOpen = false;
    },
    async submitSignupForm() {
      this.signupError = "";
      this.signupSuccess = "";

      if (
        !this.signupFormData.nome.trim() ||
        !this.signupFormData.email.trim() ||
        !this.signupFormData.numeroEstudante.trim() ||
        !this.signupFormData.anoCurricular.trim() ||
        !this.signupFormData.pelouro.trim()
      ) {
        this.signupError = "Preenche todos os campos obrigatórios.";
        return;
      }

      this.isSubmittingSignup = true;
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const response = await $fetch("/api/inscricao", {
          method: "POST",
          body: {
            nome: this.signupFormData.nome,
            email: this.signupFormData.email,
            numero_estudante: this.signupFormData.numeroEstudante,
            ano_curricular: [this.signupFormData.anoCurricular],
            pelouro: this.signupFormData.pelouro,
            company: this.signupFormData.company,
            formStartedAt: this.signupFormStartedAt,
          },
        });

        this.signupSuccess = response?.id
          ? `Inscrição enviada com sucesso. ID: ${response.id}`
          : "Inscrição enviada com sucesso.";

        this.signupFormData = {
          nome: "",
          email: "",
          numeroEstudante: "",
          anoCurricular: "",
          pelouro: "membro",
          company: "",
        };
        this.signupFormStartedAt = Date.now();
      } catch (error) {
        const backendMessage =
          error?.data?.statusMessage || error?.statusMessage;
        this.signupError =
          backendMessage ||
          "Não foi possível enviar a inscrição. Tenta novamente.";
      } finally {
        this.isSubmittingSignup = false;
        stopLoading();
      }
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

    <section class="highlights-section" aria-label="Destaques">
      <p v-if="highlightsErrorMessage" class="state-message error">
        {{ highlightsErrorMessage }}
      </p>

      <DirectusSkeleton
        v-else-if="isLoadingHighlights"
        variant="home-highlights"
        :count="3"
      />

      <p v-else-if="!highlights.length" class="state-message">
        Ainda não existem destaques publicados.
      </p>

      <div v-else class="highlights-grid">
        <article
          v-for="highlight in highlights"
          :key="highlight.id || highlight.title"
          class="highlight-card"
        >
          <h2>{{ highlight.title }}</h2>
          <p>{{ highlight.text }}</p>
        </article>
      </div>
    </section>

    <section class="join-cta" aria-label="Inscrição no núcleo">
      <div class="join-cta-content">
        <p class="join-kicker">
          <i class="fa-solid fa-user-plus" aria-hidden="true"></i>
          <span>Participação ativa</span>
        </p>
        <h2>Queres fazer parte do NeTDW?</h2>
        <p>
          Junta-te ao núcleo e participa em eventos, iniciativas e projetos que
          fortalecem a comunidade académica.
        </p>
      </div>

      <button type="button" class="join-cta-button" @click="openSignupModal">
        Inscreve-te já
      </button>
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
        variant="home-cards"
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
        variant="home-news-cards"
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
        variant="home-cards"
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

    <Transition name="signup-fade">
      <div
        v-if="isSignupModalOpen"
        class="signup-modal-overlay"
        @click="closeSignupModal"
      ></div>
    </Transition>

    <Transition name="signup-modal-slide">
      <section
        v-if="isSignupModalOpen"
        class="signup-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Formulário de inscrição"
      >
        <header class="signup-modal-header">
          <h3>Inscrição no núcleo</h3>
          <button
            type="button"
            class="close-modal-button"
            aria-label="Fechar modal"
            @click="closeSignupModal"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>

        <form class="signup-form" @submit.prevent="submitSignupForm">
          <label>
            Nome
            <input v-model="signupFormData.nome" type="text" required />
          </label>

          <label>
            Email
            <input v-model="signupFormData.email" type="email" required />
          </label>

          <label>
            Número de estudante
            <input
              v-model="signupFormData.numeroEstudante"
              type="text"
              required
            />
          </label>

          <label>
            Ano curricular
            <select v-model="signupFormData.anoCurricular" required>
              <option disabled value="">Seleciona uma opção</option>
              <option
                v-for="option in anoCurricularOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </label>

          <label>
            Pelouro de interesse
            <select v-model="signupFormData.pelouro" required>
              <option
                v-for="option in pelouroOptions"
                :key="`pelouro-${option}`"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </label>

          <label class="honeypot" aria-hidden="true">
            Empresa
            <input
              v-model="signupFormData.company"
              type="text"
              tabindex="-1"
              autocomplete="new-password"
              name="website_url"
            />
          </label>

          <p v-if="signupError" class="form-error">{{ signupError }}</p>
          <p v-if="signupSuccess" class="form-success">{{ signupSuccess }}</p>

          <div class="signup-actions">
            <button type="submit" :disabled="isSubmittingSignup">
              {{ isSubmittingSignup ? "A enviar..." : "Submeter inscrição" }}
            </button>
          </div>
        </form>
      </section>
    </Transition>
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

.highlights-section {
  margin-bottom: 3.2rem;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
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

.join-cta {
  margin-bottom: 3.1rem;
  padding: 3.65rem 0;
  border-top: 2px solid rgba(161, 195, 255, 0.52);
  border-bottom: 2px solid rgba(161, 195, 255, 0.52);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.4rem;
  min-height: 190px;
}

.join-kicker {
  margin: 0;
  color: #aecdff;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.join-cta-content h2 {
  margin: 0.48rem 0 0.65rem;
  font-size: clamp(1.72rem, 3.2vw, 2.45rem);
  line-height: 1.15;
}

.join-cta-content p {
  margin: 0;
  color: #cddcfb;
  max-width: 52ch;
  line-height: 1.68;
  font-size: 1.05rem;
}

.join-cta-button {
  border: 0;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #8ab0ff, #6f9bff);
  color: #071128;
  font-weight: 700;
  font-size: 0.96rem;
  padding: 0.78rem 1.18rem;
  cursor: pointer;
  text-decoration: none;
  align-self: center;
  white-space: nowrap;
  border: 1px solid #a8c5ff;
  transition:
    box-shadow 0.22s ease,
    filter 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease;
}

.join-cta-button:hover {
  box-shadow: 0 12px 24px rgba(30, 68, 145, 0.35);
  filter: brightness(1.05);
  background: linear-gradient(135deg, #9bbdff, #7ea8ff);
}

.join-cta-button:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
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

.signup-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 21, 0.66);
  backdrop-filter: blur(3px);
  z-index: 35;
}

.signup-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(560px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 36;
  border: 1px solid #2c4277;
  border-radius: 0.95rem;
  background: rgba(7, 14, 31, 0.98);
  box-shadow: 0 16px 36px rgba(4, 12, 30, 0.45);
  padding: 1rem;
}

.signup-modal,
.signup-modal * {
  box-sizing: border-box;
}

.signup-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.signup-modal-header h3 {
  margin: 0;
  font-size: 1.16rem;
}

.close-modal-button {
  border: 1px solid #2f457b;
  border-radius: 0.6rem;
  width: 36px;
  height: 36px;
  background: rgba(21, 36, 70, 0.75);
  color: #dce9ff;
  cursor: pointer;
  transition:
    border-color 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;
}

.close-modal-button:hover {
  border-color: #7ea7ff;
  background: rgba(37, 64, 119, 0.8);
  box-shadow: 0 10px 18px rgba(10, 24, 53, 0.28);
}

.close-modal-button:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
}

.signup-form {
  margin-top: 0.95rem;
}

.signup-form label {
  display: block;
  font-size: 0.92rem;
  color: #c9d8f8;
  margin-bottom: 0.8rem;
  min-width: 0;
}

.signup-form input,
.signup-form select {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 0.38rem;
  border: 1px solid #334a83;
  border-radius: 0.56rem;
  background: rgba(5, 11, 24, 0.85);
  color: #e6eefb;
  padding: 0.65rem 0.7rem;
  font: inherit;
}

.signup-actions {
  margin-top: 0.2rem;
}

.signup-actions button {
  border: 0;
  border-radius: 0.56rem;
  background: #84a8ff;
  color: #081229;
  font-weight: 600;
  padding: 0.6rem 1rem;
  cursor: pointer;
  transition:
    box-shadow 0.22s ease,
    filter 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease;
}

.signup-actions button:hover {
  box-shadow: 0 9px 18px rgba(30, 68, 145, 0.3);
  filter: brightness(1.03);
  background: #95b6ff;
}

.signup-actions button:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
}

.signup-actions button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.honeypot {
  position: absolute;
  left: -10000px;
  opacity: 0;
  pointer-events: none;
}

.form-error {
  margin: 0 0 0.8rem;
  color: #ffc6c6;
}

.form-success {
  margin: 0 0 0.8rem;
  color: #9fe1b3;
}

.signup-fade-enter-active,
.signup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.signup-fade-enter-from,
.signup-fade-leave-to {
  opacity: 0;
}

.signup-modal-slide-enter-active,
.signup-modal-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.signup-modal-slide-enter-from,
.signup-modal-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -45%);
}

@media (max-width: 960px) {
  .highlights-grid,
  .pelouros-grid,
  .events-grid,
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .join-cta {
    grid-template-columns: 1fr;
    align-items: center;
    min-height: 0;
    padding: 1.5rem 0;
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

  .highlights-grid,
  .pelouros-grid,
  .events-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }

  .section-top {
    align-items: center;
    gap: 0.55rem;
  }

  .signup-modal {
    width: min(620px, 94vw);
    padding: 0.92rem;
  }
}
</style>
