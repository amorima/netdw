<script setup>
import { useGlobalLoading } from "../composables/useGlobalLoading";

const { isLoading } = useGlobalLoading();
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="isLoading"
      class="global-loading"
      aria-live="polite"
      aria-label="A carregar"
    >
      <span class="spinner"></span>
    </div>
  </Transition>
</template>

<style scoped>
.global-loading {
  position: fixed;
  right: 1.2rem;
  bottom: 1.2rem;
  z-index: 200;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(122, 162, 255, 0.42);
  background: rgba(7, 13, 28, 0.78);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  pointer-events: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 2px solid rgba(120, 159, 255, 0.25);
  border-top-color: #8eb0ff;
  animation: spin 0.7s linear infinite;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
