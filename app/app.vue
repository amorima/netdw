<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  background: #050812;
}

@font-face {
  font-family: "Neiko";
  src: url("/neiko.woff2") format("woff2");
  font-display: swap;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.font-neiko {
  font-family:
    "Neiko",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}
</style>
