<script setup lang="ts">
useHead({
  title: "Núcleo de Estudantes de Tecnologias e Desenvolvimento Web",
  meta: [
    {
      name: "description",
      content:
        "Plataforma oficial do NeTDW com notícias, eventos, órgãos, pelouros e contactos para a comunidade de Tecnologias e Desenvolvimento Web Da escola Superior de Media Artes e Design.",
    },
    { name: "theme-color", content: "#050812" },
  ],
  link: [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    { rel: "manifest", href: "/site.webmanifest" },
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
    },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
