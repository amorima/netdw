<script setup>
import { createDirectus, rest, readItems } from "@directus/sdk";

const directus = createDirectus("https://api.netdw.tech").with(rest());

// Adição de verificação de erro para diagnóstico
const { data: noticias, error } = await useAsyncData("noticias", () => {
  return directus.request(readItems("noticias"));
});

// Registo de erro na consola do browser para facilitar a depuração
if (error.value) {
  console.error("Erro ao carregar dados do Directus:", error.value);
}
</script>

<template>
  <div>
    <h1>Últimas notícias</h1>

    <div v-if="error" style="color: red">
      Erro ao ligar à API: {{ error.message }}
    </div>

    <div v-else-if="noticias && noticias.length > 0">
      <div
        v-for="item in noticias"
        :key="item.id"
        style="margin-bottom: 20px; border-bottom: 1px solid #ccc"
      >
        <h2>{{ item.titulo }}</h2>
        <div v-html="item.conteudo"></div>
      </div>
    </div>

    <p v-else>A carregar notícias ou sem conteúdo disponível...</p>
  </div>
</template>
