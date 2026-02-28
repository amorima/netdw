<script>
export default defineNuxtComponent({
  data() {
    return {
      currentYear: new Date().getFullYear(),
      isMobileMenuOpen: false,
      navigationItems: [
        { label: "Homepage", to: "/" },
        { label: "Sobre NeTDW", to: "/sobre-netdw" },
        { label: "Pelouros", to: "/pelouros" },
        { label: "Órgãos", to: "/orgaos" },
        { label: "Eventos", to: "/eventos" },
        { label: "Contactos", to: "/contactos" },
      ],
      footerLinks: [
        { label: "Homepage", to: "/" },
        { label: "Sobre NeTDW", to: "/sobre-netdw" },
        { label: "Pelouros", to: "/pelouros" },
        { label: "Órgãos", to: "/orgaos" },
        { label: "Eventos", to: "/eventos" },
        { label: "Notícias", to: "/noticias" },
        { label: "Contactos", to: "/contactos" },
      ],
    };
  },
  computed: {
    currentPath() {
      return this.$route.path;
    },
  },
  watch: {
    currentPath() {
      this.isMobileMenuOpen = false;
    },
  },
  methods: {
    isActive(routePath) {
      if (routePath === "/") {
        return this.currentPath === "/";
      }

      return this.currentPath.startsWith(routePath);
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
  },
});
</script>

<template>
  <div class="page-wrapper">
    <header class="topbar">
      <div class="container topbar-content">
        <NuxtLink to="/" class="brand" aria-label="Ir para homepage">
          <img src="/logo_d.svg" alt="Logo NeTDW" class="brand-logo" />
        </NuxtLink>

        <button
          class="burger-button"
          type="button"
          aria-label="Abrir ou fechar menu de navegação"
          aria-controls="mobile-main-menu"
          :aria-expanded="String(isMobileMenuOpen)"
          @click="toggleMobileMenu"
        >
          <span class="burger-lines" :class="{ open: isMobileMenuOpen }"></span>
        </button>

        <nav class="menu" aria-label="Navegação principal">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="menu-item"
            :class="{ active: isActive(item.to) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <Transition name="mobile-menu-fade">
          <div
            v-if="isMobileMenuOpen"
            class="mobile-menu-overlay"
            @click="closeMobileMenu"
          ></div>
        </Transition>

        <Transition name="mobile-menu-slide">
          <nav
            v-if="isMobileMenuOpen"
            id="mobile-main-menu"
            class="mobile-menu"
            aria-label="Navegação principal mobile"
          >
            <NuxtLink
              v-for="item in navigationItems"
              :key="`mobile-${item.to}`"
              :to="item.to"
              class="mobile-menu-item"
              :class="{ active: isActive(item.to) }"
              @click="closeMobileMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </Transition>
      </div>
    </header>

    <main class="page-content">
      <slot />
    </main>

    <GlobalLoading />

    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <img src="/logo_d.svg" alt="Logo NeTDW" class="footer-logo" />
          <p class="footer-copy">
            Núcleo de Estudantes de Tecnologias e Desenvolvimento Web.
          </p>
        </div>

        <div>
          <h3>Links rápidos</h3>
          <ul class="quick-links">
            <li v-for="item in footerLinks" :key="item.to">
              <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3>Contactos</h3>
          <ul class="contact-list">
            <li>
              <i class="fa-regular fa-envelope" aria-hidden="true"></i>
              <a href="mailto:netdw.esmad@gmail.com">netdw.esmad@gmail.com</a>
            </li>
            <li>
              <i class="fa-brands fa-instagram" aria-hidden="true"></i>
              <a
                href="https://instagram.com/ne.tdw"
                target="_blank"
                rel="noopener noreferrer"
                >@ne.tdw</a
              >
            </li>
            <li class="address-item">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              <address>
                Escola Superior de Media Artes e Design<br />
                Rua D. Sancho I, n.º 981<br />
                4480-876 Vila do Conde<br />
                Portugal
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div class="container footer-bottom">
        <p>© {{ currentYear }} NeTDW. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page-wrapper {
  min-height: 100vh;
  color: #e6eefb;
  background:
    radial-gradient(
      circle at 80% -10%,
      rgba(60, 102, 255, 0.24),
      transparent 36%
    ),
    radial-gradient(
      circle at -10% 25%,
      rgba(0, 200, 255, 0.16),
      transparent 30%
    ),
    #050812;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.container {
  width: min(1120px, 92%);
  margin: 0 auto;
}

.page-content {
  min-height: calc(100vh - 220px);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(5, 8, 18, 0.55);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(73, 103, 179, 0.35);
}

.topbar-content {
  padding: 0.9rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.brand-logo {
  width: clamp(132px, 17vw, 180px);
  height: auto;
}

.burger-button {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid #2a3a66;
  border-radius: 0.85rem;
  background: rgba(19, 32, 63, 0.55);
  color: #d8e4ff;
  cursor: pointer;
  position: relative;
  z-index: 31;
}

.burger-lines,
.burger-lines::before,
.burger-lines::after {
  display: block;
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  position: absolute;
  left: 50%;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.burger-lines {
  top: 50%;
  transform: translate(-50%, -50%);
}

.burger-lines::before,
.burger-lines::after {
  content: "";
  transform: translateX(-50%);
}

.burger-lines::before {
  top: -6px;
}

.burger-lines::after {
  top: 6px;
}

.burger-lines.open {
  transform: translate(-50%, -50%) rotate(45deg);
}

.burger-lines.open::before {
  opacity: 0;
}

.burger-lines.open::after {
  top: 0;
  transform: translateX(-50%) rotate(-90deg);
}

.menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.menu-item {
  font-size: 0.88rem;
  color: #d8e4ff;
  text-decoration: none;
  padding: 0.45rem 0.72rem;
  border: 1px solid #2a3a66;
  border-radius: 0.62rem;
  background: rgba(19, 32, 63, 0.45);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.menu-item:hover {
  border-color: #7ea7ff;
  background: rgba(58, 92, 174, 0.35);
  transform: translateY(-1px);
}

.menu-item.active {
  border-color: #86abff;
  background: rgba(74, 113, 205, 0.32);
}

.mobile-menu-overlay,
.mobile-menu {
  display: none;
}

.footer {
  border-top: 1px solid #1f3059;
  background: rgba(3, 6, 14, 0.76);
  padding-top: 1.8rem;
  margin-top: 2.5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 1.3rem;
}

.footer-logo {
  width: 150px;
  height: auto;
}

.footer-copy {
  margin: 0.8rem 0 0;
  color: #a8badf;
  max-width: 340px;
  line-height: 1.55;
}

.footer h3 {
  margin: 0;
  font-size: 1.02rem;
}

.footer ul {
  margin: 0.7rem 0 0;
  padding: 0;
  list-style: none;
}

.footer li {
  margin-bottom: 0.55rem;
  color: #9caed8;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 0.9rem;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.contact-list i {
  width: 1rem;
  margin-top: 0.18rem;
  color: #aecdff;
}

.contact-list address {
  margin: 0;
  font-style: normal;
  color: #9caed8;
  line-height: 1.5;
}

.address-item {
  margin-top: 0.7rem;
}

.footer a {
  color: #aecdff;
  text-decoration: none;
}

.footer a:hover {
  color: #d8e6ff;
}

.footer-bottom {
  margin-top: 1rem;
  padding: 1rem 0 1.5rem;
  border-top: 1px solid #1f3059;
}

.footer-bottom p {
  margin: 0;
  color: #8ea4d2;
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .topbar-content {
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .menu {
    display: none;
  }

  .burger-button {
    display: inline-block;
  }

  .mobile-menu-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 24;
    background: rgba(3, 6, 12, 0.55);
    backdrop-filter: blur(2px);
  }

  .mobile-menu {
    display: grid;
    gap: 0.5rem;
    position: absolute;
    top: calc(100% + 0.55rem);
    left: 0;
    right: 0;
    z-index: 30;
    padding: 0.7rem;
    border: 1px solid #2a3a66;
    border-radius: 0.95rem;
    background: rgba(9, 15, 31, 0.96);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
  }

  .mobile-menu-item {
    font-size: 0.95rem;
    color: #d8e4ff;
    text-decoration: none;
    padding: 0.68rem 0.78rem;
    border: 1px solid #2a3a66;
    border-radius: 0.7rem;
    background: rgba(19, 32, 63, 0.45);
  }

  .mobile-menu-item.active {
    border-color: #86abff;
    background: rgba(74, 113, 205, 0.32);
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .quick-links {
    grid-template-columns: 1fr;
  }
}

.mobile-menu-fade-enter-active,
.mobile-menu-fade-leave-active {
  transition: opacity 0.2s ease;
}

.mobile-menu-fade-enter-from,
.mobile-menu-fade-leave-to {
  opacity: 0;
}

.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.mobile-menu-slide-enter-from,
.mobile-menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
