<script>
import { useGlobalLoading } from "../composables/useGlobalLoading";

export default defineNuxtComponent({
  data() {
    return {
      contactEmail: "netdw.esmad@gmail.com",
      contactInstagram: "@ne.tdw",
      instagramUrl: "https://instagram.com/ne.tdw",
      formData: {
        name: "",
        email: "",
        subject: "",
        message: "",
        company: "",
      },
      formError: "",
      formSuccess: "",
      isSubmitting: false,
      formStartedAt: Date.now(),
    };
  },
  methods: {
    async submitContactForm() {
      this.formError = "";
      this.formSuccess = "";

      if (
        !this.formData.name.trim() ||
        !this.formData.email.trim() ||
        !this.formData.message.trim()
      ) {
        this.formError = "Preenche nome, email e mensagem.";
        return;
      }

      this.isSubmitting = true;
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const response = await $fetch("/api/contact", {
          method: "POST",
          body: {
            name: this.formData.name,
            email: this.formData.email,
            subject: this.formData.subject,
            message: this.formData.message,
            company: this.formData.company,
            formStartedAt: this.formStartedAt,
          },
        });

        this.formSuccess = response?.id
          ? `Mensagem enviada com sucesso. ID: ${response.id}`
          : "Mensagem enviada com sucesso.";
        this.formData = {
          name: "",
          email: "",
          subject: "",
          message: "",
          company: "",
        };
        this.formStartedAt = Date.now();
      } catch (error) {
        const backendMessage =
          error?.data?.statusMessage || error?.statusMessage;
        this.formError =
          backendMessage ||
          "Não foi possível enviar a mensagem. Tenta novamente.";
      } finally {
        this.isSubmitting = false;
        stopLoading();
      }
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Contactos</p>
    <h1>Fala connosco</h1>

    <div class="contact-cards">
      <article class="card contact-card">
        <h2><i class="fa-regular fa-envelope" aria-hidden="true"></i>Email</h2>
        <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
      </article>

      <article class="card contact-card">
        <h2>
          <i class="fa-brands fa-instagram" aria-hidden="true"></i>Instagram
        </h2>
        <a :href="instagramUrl" target="_blank" rel="noopener noreferrer">{{
          contactInstagram
        }}</a>
      </article>

      <article class="card contact-card">
        <h2>
          <i class="fa-solid fa-location-dot" aria-hidden="true"></i>Morada
        </h2>
        <address>
          Escola Superior de Media Artes e Design<br />
          Rua D. Sancho I, n.º 981<br />
          4480-876 Vila do Conde<br />
          Portugal
        </address>
      </article>
    </div>

    <div class="interaction-grid">
      <article class="card form-card">
        <h2>Enviar mensagem</h2>
        <form @submit.prevent="submitContactForm">
          <div class="form-grid">
            <label>
              Nome
              <input v-model="formData.name" type="text" required />
            </label>

            <label>
              Email
              <input v-model="formData.email" type="email" required />
            </label>
          </div>

          <label>
            Assunto (opcional)
            <input v-model="formData.subject" type="text" />
          </label>

          <label>
            Mensagem
            <textarea v-model="formData.message" rows="6" required></textarea>
          </label>

          <label class="honeypot" aria-hidden="true">
            Empresa
            <input
              v-model="formData.company"
              type="text"
              tabindex="-1"
              autocomplete="new-password"
              name="website_url"
            />
          </label>

          <p v-if="formError" class="form-error">{{ formError }}</p>
          <p v-if="formSuccess" class="form-success">{{ formSuccess }}</p>

          <button type="submit" :disabled="isSubmitting">Submeter</button>
        </form>
      </article>

      <article class="card map-card">
        <h2>Localização</h2>
        <iframe
          title="Mapa da Escola Superior de Media Artes e Design"
          src="https://www.google.com/maps?q=Escola%20Superior%20de%20Media%20Artes%20e%20Design%2C%20Vila%20do%20Conde&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </article>
    </div>
  </section>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

*::before,
*::after {
  box-sizing: border-box;
}

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
  margin: 0.6rem 0 1.3rem;
  font-size: clamp(1.9rem, 3.8vw, 2.7rem);
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.contact-card:last-child {
  grid-column: 1 / -1;
}

.card {
  padding: 1.05rem;
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
}

.card h2 {
  margin: 0;
  font-size: 1.06rem;
}

.contact-card h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-card i {
  color: #aecdff;
  font-size: 0.95rem;
}

.contact-card a,
.contact-card address {
  margin: 0.8rem 0 0;
  display: block;
  color: #c9d8f8;
  text-decoration: none;
  line-height: 1.5;
}

.contact-card a {
  color: #aecdff;
}

.contact-card a:hover {
  color: #d8e6ff;
}

.contact-card address {
  font-style: normal;
}

.interaction-grid {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 0.9rem;
}

.map-card iframe {
  margin-top: 0.8rem;
  width: 100%;
  height: 360px;
  border: 0;
  border-radius: 0.65rem;
  filter: brightness(0.72) contrast(1.1) saturate(0.8) hue-rotate(185deg);
}

form {
  margin-top: 0.8rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

label {
  display: block;
  font-size: 0.92rem;
  color: #c9d8f8;
  margin-bottom: 0.8rem;
}

input,
textarea {
  width: 100%;
  max-width: 100%;
  margin-top: 0.38rem;
  border: 1px solid #334a83;
  border-radius: 0.56rem;
  background: rgba(5, 11, 24, 0.85);
  color: #e6eefb;
  padding: 0.65rem 0.7rem;
  font: inherit;
}

textarea {
  resize: vertical;
}

button {
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

button:hover {
  box-shadow: 0 9px 18px rgba(30, 68, 145, 0.3);
  filter: brightness(1.03);
  background: #95b6ff;
}

button:focus-visible {
  outline: 2px solid #d2e3ff;
  outline-offset: 2px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-error {
  margin: 0 0 0.8rem;
  color: #ffc6c6;
}

.form-success {
  margin: 0 0 0.8rem;
  color: #9fe1b3;
}

.honeypot {
  position: absolute;
  left: -10000px;
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 960px) {
  .contact-cards {
    grid-template-columns: 1fr;
  }

  .contact-card:last-child {
    grid-column: auto;
  }

  .interaction-grid {
    grid-template-columns: 1fr;
  }

  .map-card iframe {
    height: 320px;
  }
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  button {
    width: 100%;
  }
}
</style>
