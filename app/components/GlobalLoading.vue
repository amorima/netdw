<script setup>
import { onMounted, ref } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const { isLoading } = useGlobalLoading();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="isMounted && isLoading"
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
  top: 4.6rem;
  right: 1rem;
  z-index: 35;
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

@media (max-width: 768px) {
  .global-loading {
    top: 4.2rem;
    right: 0.75rem;
  }
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
