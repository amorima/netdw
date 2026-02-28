<script>
export default defineNuxtComponent({
  props: {
    variant: {
      type: String,
      default: "cards",
    },
    count: {
      type: Number,
      default: 6,
    },
  },
  computed: {
    items() {
      return Array.from({ length: this.count }, (_, index) => index + 1);
    },
  },
});
</script>

<template>
  <div
    v-if="variant === 'hero'"
    class="directus-skeleton-hero"
    aria-hidden="true"
  >
    <div class="skeleton-line skeleton-kicker"></div>
    <div class="skeleton-line skeleton-title"></div>
    <div class="skeleton-line skeleton-title short"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text short"></div>
    <div class="skeleton-actions">
      <div class="skeleton-button"></div>
      <div class="skeleton-button"></div>
    </div>
  </div>

  <div
    v-else-if="variant === 'article'"
    class="directus-skeleton-article"
    aria-hidden="true"
  >
    <div class="skeleton-line skeleton-date"></div>
    <div class="skeleton-line skeleton-heading"></div>
    <div class="skeleton-image"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text short"></div>
    <div class="skeleton-button"></div>
  </div>

  <div
    v-else-if="variant === 'text'"
    class="directus-skeleton-text"
    aria-hidden="true"
  >
    <div class="skeleton-line skeleton-heading"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text short"></div>
  </div>

  <div
    v-else-if="variant === 'sobre'"
    class="directus-skeleton-text"
    aria-hidden="true"
  >
    <div class="skeleton-line skeleton-title"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text"></div>
    <div class="skeleton-line skeleton-text short"></div>
  </div>

  <div
    v-else-if="variant === 'event-cards'"
    class="directus-skeleton-grid"
    aria-hidden="true"
  >
    <article
      v-for="item in items"
      :key="`event-skeleton-${item}`"
      class="directus-skeleton-card"
    >
      <div class="skeleton-pills">
        <span class="skeleton-pill"></span>
        <span class="skeleton-pill"></span>
      </div>
      <div class="skeleton-line skeleton-date"></div>
      <div class="skeleton-line skeleton-heading"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>
    </article>
  </div>

  <div
    v-else-if="variant === 'orgaos'"
    class="directus-skeleton-orgaos"
    aria-hidden="true"
  >
    <article
      v-for="item in items"
      :key="`orgaos-skeleton-${item}`"
      class="orgaos-year-skeleton"
    >
      <div class="orgaos-year-toggle-skeleton">
        <div class="skeleton-line skeleton-year"></div>
        <div class="skeleton-circle"></div>
      </div>

      <div class="orgaos-year-content-skeleton">
        <div class="skeleton-line skeleton-section-title"></div>
        <div class="orgaos-members-grid-skeleton">
          <article
            v-for="member in 3"
            :key="`orgaos-dir-${item}-${member}`"
            class="directus-skeleton-card"
          >
            <div class="skeleton-avatar"></div>
            <div class="skeleton-line skeleton-heading center"></div>
            <div class="skeleton-line skeleton-text center short"></div>
            <div class="skeleton-circle tiny"></div>
          </article>
        </div>

        <div class="skeleton-line skeleton-section-title"></div>
        <div class="orgaos-members-grid-skeleton">
          <article
            v-for="member in 2"
            :key="`orgaos-ple-${item}-${member}`"
            class="directus-skeleton-card"
          >
            <div class="skeleton-avatar"></div>
            <div class="skeleton-line skeleton-heading center"></div>
            <div class="skeleton-line skeleton-text center short"></div>
            <div class="skeleton-circle tiny"></div>
          </article>
        </div>

        <div class="skeleton-line skeleton-section-title"></div>
        <div class="orgaos-members-grid-skeleton">
          <article
            v-for="member in 3"
            :key="`orgaos-pel-${item}-${member}`"
            class="directus-skeleton-card"
          >
            <div class="skeleton-avatar"></div>
            <div class="skeleton-line skeleton-heading center"></div>
            <div class="skeleton-line skeleton-text center short"></div>
            <div class="skeleton-circle tiny"></div>
          </article>
        </div>
      </div>
    </article>
  </div>

  <div
    v-else-if="variant === 'news-cards'"
    class="directus-skeleton-grid"
    aria-hidden="true"
  >
    <article
      v-for="item in items"
      :key="`news-skeleton-${item}`"
      class="directus-skeleton-card no-padding"
    >
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-date"></div>
        <div class="skeleton-line skeleton-heading"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
        <div class="skeleton-button"></div>
      </div>
    </article>
  </div>

  <div v-else class="directus-skeleton-grid" aria-hidden="true">
    <article
      v-for="item in items"
      :key="`card-skeleton-${item}`"
      class="directus-skeleton-card"
    >
      <div class="skeleton-line skeleton-heading"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>
    </article>
  </div>
</template>

<style scoped>
.directus-skeleton-hero,
.directus-skeleton-article,
.directus-skeleton-text,
.directus-skeleton-card,
.orgaos-year-skeleton {
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
}

.directus-skeleton-orgaos {
  display: grid;
  gap: 0.9rem;
}

.orgaos-year-toggle-skeleton {
  border-bottom: 1px solid #263a67;
  background: rgba(16, 29, 56, 0.72);
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.orgaos-year-content-skeleton {
  padding: 1rem;
}

.orgaos-members-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1.3rem;
}

.skeleton-avatar {
  width: 90px;
  height: 90px;
  border-radius: 999px;
  margin: 0 auto 0.7rem;
  background: linear-gradient(
    100deg,
    rgba(35, 56, 99, 0.32) 20%,
    rgba(81, 112, 183, 0.42) 38%,
    rgba(35, 56, 99, 0.32) 56%
  );
  background-size: 220% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-circle {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  background: linear-gradient(
    100deg,
    rgba(35, 56, 99, 0.32) 20%,
    rgba(81, 112, 183, 0.42) 38%,
    rgba(35, 56, 99, 0.32) 56%
  );
  background-size: 220% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-circle.tiny {
  width: 1rem;
  height: 1rem;
  margin: 0.55rem auto 0;
}

.directus-skeleton-hero {
  min-height: 360px;
  padding: 2.4rem;
}

.directus-skeleton-article {
  padding: 1.2rem;
}

.directus-skeleton-text {
  padding: 1rem;
  max-width: 800px;
}

.directus-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.directus-skeleton-card {
  position: relative;
  padding: 1rem;
}

.directus-skeleton-card.no-padding {
  overflow: hidden;
  padding: 0;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-line,
.skeleton-button,
.skeleton-pill,
.skeleton-image {
  border-radius: 0.55rem;
  background: linear-gradient(
    100deg,
    rgba(35, 56, 99, 0.32) 20%,
    rgba(81, 112, 183, 0.42) 38%,
    rgba(35, 56, 99, 0.32) 56%
  );
  background-size: 220% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-kicker {
  height: 0.78rem;
  width: 44%;
  margin-bottom: 0.9rem;
}

.skeleton-year {
  height: 0.95rem;
  width: 24%;
}

.skeleton-section-title {
  height: 0.95rem;
  width: 28%;
  margin: 0.15rem auto 0.9rem;
}

.skeleton-title {
  height: 1.95rem;
  width: 92%;
  margin-bottom: 0.45rem;
}

.skeleton-heading {
  height: 1.1rem;
  width: 74%;
  margin-bottom: 0.7rem;
}

.skeleton-date {
  height: 0.72rem;
  width: 34%;
  margin-bottom: 0.6rem;
}

.skeleton-text {
  height: 0.96rem;
  width: 84%;
  margin-top: 0.52rem;
}

.skeleton-button {
  width: 8.3rem;
  height: 2.2rem;
  margin-top: 0.9rem;
}

.skeleton-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.1rem;
}

.skeleton-pills {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  display: flex;
  gap: 0.35rem;
}

.skeleton-pill {
  width: 3rem;
  height: 1.15rem;
  border-radius: 999px;
}

.skeleton-image {
  width: 100%;
  height: 180px;
}

.short {
  width: 56%;
}

.center {
  margin-left: auto;
  margin-right: auto;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 960px) {
  .directus-skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .orgaos-members-grid-skeleton {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .directus-skeleton-grid {
    grid-template-columns: 1fr;
  }

  .orgaos-members-grid-skeleton {
    grid-template-columns: 1fr;
  }

  .directus-skeleton-hero {
    min-height: 320px;
    padding: 1.6rem 1.15rem;
  }
}
</style>
