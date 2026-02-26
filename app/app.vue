<script setup>
import { createDirectus, rest, readItems } from "@directus/sdk";

const urlDirectus = "https://api.netdw.tech";
const directus = createDirectus(urlDirectus).with(rest());

const { data: noticias, error } = await useAsyncData("noticias", () => {
  return directus.request(readItems("noticias"));
});

// Função simples para gerar o URL da imagem com base no ID fornecido pela API
const getImageUrl = (fileId) => {
  if (!fileId) return "https://via.placeholder.com/400x200?text=Sem+Capa";
  return `${urlDirectus}/assets/${fileId}`;
};
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto; font-family: sans-serif">
    <h1>Últimas notícias</h1>

    <div v-if="error" style="color: red">
      Erro ao ligar à API: {{ error.message }}
    </div>

    <div v-else-if="noticias && noticias.length > 0">
      <div
        v-for="item in noticias"
        :key="item.id"
        style="
          margin-bottom: 40px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        "
      >
        <img
          :src="getImageUrl(item.capa)"
          alt="Capa da notícia"
          style="
            width: 100%;
            max-height: 400px;
            object-fit: cover;
            border-radius: 8px;
          "
        />

        <h2 style="margin-top: 15px">{{ item.titulo }}</h2>
        <div v-html="item.conteudo" style="line-height: 1.6; color: #333"></div>
      </div>
    </div>

    <p v-else>A carregar notícias...</p>
  </div>
</template>
