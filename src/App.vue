<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
/* Reset global */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Space Grotesk', sans-serif;
  background-color: #0a0a0a;
  color: #ffffff;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
