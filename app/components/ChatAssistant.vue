<script>
import { useGlobalLoading } from "../composables/useGlobalLoading";

export default defineNuxtComponent({
  data() {
    return {
      isOpen: false,
      connectionState: "thinking",
      messages: [
        {
          id: "welcome",
          role: "assistant",
          text: "Olá, sou o Assitente NeTDW. Posso ajudar com dúvidas sobre o núcleo, eventos, notícias e restantes conteúdos públicos.",
        },
      ],
      userInput: "",
      isSending: false,
      threadId: "",
      lastError: "",
    };
  },
  computed: {
    ledClass() {
      return {
        online: this.connectionState === "online",
        offline: this.connectionState === "offline",
        thinking: this.connectionState === "thinking",
      };
    },
  },
  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.scrollToLatest("auto");
        });
      }
    },
    "messages.length"() {
      this.$nextTick(() => {
        this.scrollToLatest("smooth");
      });
    },
  },
  mounted() {
    this.ensureThreadId();
    this.checkHealth();
  },
  methods: {
    scrollToLatest(behavior = "smooth") {
      const body = this.$refs.chatBody;

      if (!body) {
        return;
      }

      if (typeof body.scrollTo === "function") {
        body.scrollTo({
          top: body.scrollHeight,
          behavior,
        });
        return;
      }

      body.scrollTop = body.scrollHeight;
    },
    handleInput() {
      this.scrollToLatest("auto");
    },
    escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },
    formatMessageHtml(message) {
      const rawText = String(message?.text || "");
      const escaped = this.escapeHtml(rawText);

      const lines = escaped.split(/\r?\n/);
      const htmlLines = [];
      let inList = false;

      const closeListIfOpen = () => {
        if (inList) {
          htmlLines.push("</ul>");
          inList = false;
        }
      };

      lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
          closeListIfOpen();
          htmlLines.push("<br>");
          return;
        }

        const headingMatch = trimmed.match(/^###\s+(.+)/);
        if (headingMatch) {
          closeListIfOpen();
          const headingText = this.applyInlineMarkdown(headingMatch[1]);
          htmlLines.push(`<h4>${headingText}</h4>`);
          return;
        }

        const listMatch = trimmed.match(/^[-*]\s+(.+)/);
        const numberedListMatch = trimmed.match(/^\d+\.\s+(.+)/);
        if (listMatch || numberedListMatch) {
          if (!inList) {
            htmlLines.push("<ul>");
            inList = true;
          }

          const itemText = this.applyInlineMarkdown(
            (listMatch?.[1] || numberedListMatch?.[1] || "").trim(),
          );
          htmlLines.push(`<li>${itemText}</li>`);
          return;
        }

        closeListIfOpen();
        htmlLines.push(`<p>${this.applyInlineMarkdown(trimmed)}</p>`);
      });

      closeListIfOpen();

      return htmlLines.join("");
    },
    applyInlineMarkdown(value) {
      return String(value || "")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
    },
    ensureThreadId() {
      const storageKey = "netdw-chat-thread-id";
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        this.threadId = saved;
        return;
      }

      this.threadId = `netdw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(storageKey, this.threadId);
    },
    toggleOpen() {
      this.isOpen = !this.isOpen;
    },
    async checkHealth() {
      this.connectionState = "thinking";

      try {
        const response = await $fetch("/api/chatbot-health");
        this.connectionState = response?.ok ? "online" : "offline";
      } catch {
        this.connectionState = "offline";
      }
    },
    async sendMessage() {
      const message = this.userInput.trim();
      if (!message || this.isSending) {
        return;
      }

      this.lastError = "";

      this.messages.push({
        id: `user-${Date.now()}`,
        role: "user",
        text: message,
      });

      this.$nextTick(() => {
        this.scrollToLatest("smooth");
      });

      this.userInput = "";
      this.isSending = true;
      this.connectionState = "thinking";

      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const response = await $fetch("/api/chatbot", {
          method: "POST",
          body: {
            message,
            threadId: this.threadId,
          },
        });

        this.messages.push({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text:
            String(response?.answer || "").trim() ||
            "Não consegui gerar resposta de momento.",
        });

        this.connectionState = "online";
      } catch (error) {
        const backendMessage =
          error?.data?.statusMessage ||
          error?.statusMessage ||
          "Falha ao contactar o assistente.";

        this.lastError = backendMessage;
        this.messages.push({
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "Ocorreu um erro ao obter resposta. Tenta novamente dentro de instantes.",
        });
        this.connectionState = "offline";
      } finally {
        this.isSending = false;
        stopLoading();

        this.$nextTick(() => {
          this.scrollToLatest("smooth");
        });
      }
    },
  },
});
</script>

<template>
  <div class="chatbot-wrapper">
    <button
      type="button"
      class="chatbot-fab"
      aria-label="Abrir assistente"
      @click="toggleOpen"
    >
      <i class="fa-solid fa-robot" aria-hidden="true"></i>
    </button>

    <Transition name="chatbot-fade">
      <section
        v-if="isOpen"
        class="chatbot-panel"
        role="dialog"
        aria-modal="false"
      >
        <header class="chatbot-header">
          <div class="chatbot-title-wrap">
            <h3>Assistente NeTDW</h3>
            <span class="status-led" :class="ledClass"></span>
          </div>
          <div class="chatbot-header-right">
            <button
              type="button"
              class="close-chat"
              aria-label="Fechar chatbot"
              @click="toggleOpen"
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </header>

        <div ref="chatBody" class="chatbot-body">
          <article
            v-for="message in messages"
            :key="message.id"
            class="chat-message"
            :class="message.role"
          >
            <div
              class="chat-message-content"
              v-html="formatMessageHtml(message)"
            ></div>
          </article>

          <p v-if="lastError" class="chat-error">{{ lastError }}</p>
        </div>

        <form class="chatbot-input" @submit.prevent="sendMessage">
          <input
            v-model="userInput"
            type="text"
            placeholder="Escreve a tua pergunta..."
            :disabled="isSending"
            @input="handleInput"
          />
          <button type="submit" :disabled="isSending || !userInput.trim()">
            {{ isSending ? "..." : "Enviar" }}
          </button>
        </form>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 45;
}

.chatbot-fab {
  width: 56px;
  height: 56px;
  border: 1px solid #7ea7ff;
  border-radius: 999px;
  background: linear-gradient(145deg, #7fa6ff, #6a96fb);
  color: #071128;
  cursor: pointer;
  box-shadow: 0 14px 24px rgba(8, 25, 56, 0.35);
  transition:
    transform 0.2s ease,
    filter 0.2s ease,
    box-shadow 0.2s ease;
}

.chatbot-fab i {
  font-size: 1.25rem;
}

.chatbot-fab:hover {
  filter: brightness(1.05);
  transform: scale(1.03);
}

.chatbot-panel {
  position: absolute;
  right: 0;
  bottom: 70px;
  width: min(380px, 92vw);
  height: min(520px, 72vh);
  border: 1px solid #2e467d;
  border-radius: 0.9rem;
  background: rgba(7, 14, 31, 0.98);
  box-shadow: 0 16px 34px rgba(4, 12, 30, 0.45);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.chatbot-header {
  padding: 0.8rem 0.85rem;
  border-bottom: 1px solid #22345c;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #dce8ff;
}

.chatbot-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.chatbot-header-right {
  display: flex;
  align-items: center;
}

.status-led {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(14, 24, 47, 0.78);
}

.status-led.online {
  background: #44d07a;
}

.status-led.offline {
  background: #e96a6a;
}

.status-led.thinking {
  background: #f5c145;
}

.close-chat {
  border: 1px solid #2f457b;
  border-radius: 0.45rem;
  background: rgba(21, 36, 70, 0.75);
  color: #dce9ff;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.chatbot-body {
  padding: 0.85rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  scrollbar-width: thin;
  scrollbar-color: #6f95f6 rgba(17, 28, 54, 0.75);
}

.chatbot-body::-webkit-scrollbar {
  width: 6px;
}

.chatbot-body::-webkit-scrollbar-track {
  background: rgba(17, 28, 54, 0.75);
  border-radius: 999px;
}

.chatbot-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #81a5ff, #5f86e6);
  border-radius: 999px;
}

.chatbot-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #95b4ff, #7094eb);
}

.chat-message {
  max-width: 88%;
  border: 1px solid #2a3d6c;
  border-radius: 0.7rem;
  padding: 0.55rem 0.65rem;
  background: rgba(11, 21, 43, 0.88);
}

.chat-message-content :deep(p) {
  margin: 0;
  color: #d6e4ff;
  line-height: 1.45;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-message-content :deep(br) {
  line-height: 1.2;
}

.chat-message-content :deep(h4) {
  margin: 0 0 0.3rem 0;
  color: #e9f0ff;
  font-size: 0.92rem;
  line-height: 1.35;
}

.chat-message-content :deep(ul) {
  margin: 0.15rem 0 0.2rem 1rem;
  padding: 0;
}

.chat-message-content :deep(li) {
  color: #d6e4ff;
  line-height: 1.42;
  margin: 0.15rem 0;
  font-size: 0.9rem;
}

.chat-message-content :deep(strong) {
  color: #eef4ff;
}

.chat-message.user {
  align-self: flex-end;
  background: rgba(58, 92, 174, 0.32);
  border-color: #4566ad;
}

.chat-message.assistant {
  align-self: flex-start;
}

.chat-error {
  margin: 0;
  color: #ffb8b8;
  font-size: 0.82rem;
}

.chatbot-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.72rem;
  border-top: 1px solid #22345c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.chatbot-input input {
  flex: 1 1 auto;
  max-width: 100%;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #334a83;
  border-radius: 0.56rem;
  background: rgba(5, 11, 24, 0.85);
  color: #e6eefb;
  padding: 0.56rem 0.65rem;
  font: inherit;
  min-width: 0;
}

.chatbot-input button {
  flex: 0 0 auto;
  box-sizing: border-box;
  border: 0;
  border-radius: 0.56rem;
  background: #84a8ff;
  color: #081229;
  font-weight: 600;
  padding: 0.56rem 0.76rem;
  cursor: pointer;
}

.chatbot-input button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.chatbot-fade-enter-active,
.chatbot-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.chatbot-fade-enter-from,
.chatbot-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .chatbot-wrapper {
    right: 0.75rem;
    bottom: 0.75rem;
  }

  .chatbot-panel {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
    right: 0;
    bottom: 0;
  }

  .chatbot-body {
    padding: 0.75rem;
  }

  .chat-message {
    max-width: 94%;
  }

  .chatbot-input {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .chatbot-input input,
  .chatbot-input button {
    max-width: 100%;
  }

  .chatbot-input button {
    width: 100%;
    padding: 0.62rem 0.76rem;
  }
}
</style>
