<script setup>
import { createDirectus, rest, readItems } from '@directus/sdk';

// Inicialização do cliente Directus apontando para o teu subdomínio da API
const directus = createDirectus('https://api.netdw.tech').with(rest());

// Pedido assíncrono para obter a lista de notícias da coleção criada
const { data: noticias } = await useAsyncData('noticias', () => {
  return directus.request(readItems('noticias'));
});
</script>

<template>
  <div>
    <h1>Últimas notícias</h1>
    
    <div v-if="noticias">
      <div v-for="item in noticias" :key="item.id" style="margin-bottom: 20px;">
        <h2>{{ item.titulo }}</h2>
        <div v-html="item.conteudo"></div>
      </div>
    </div>
    
    <p v-else>A carregar notícias...</p>
  </div>
</template>