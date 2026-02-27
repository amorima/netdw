import { computed } from "vue";

export function useGlobalLoading() {
  const loadingCount = useState("global-loading-count", () => 0);

  const start = () => {
    if (import.meta.server) {
      return () => {};
    }

    loadingCount.value += 1;
    let stopped = false;

    return () => {
      if (stopped) {
        return;
      }

      stopped = true;
      loadingCount.value = Math.max(0, loadingCount.value - 1);
    };
  };

  const reset = () => {
    loadingCount.value = 0;
  };

  const isLoading = computed(() => loadingCount.value > 0);

  return {
    start,
    reset,
    isLoading,
  };
}
