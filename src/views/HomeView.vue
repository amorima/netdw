<template>
  <section class="hero" ref="hero" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <!-- Fundo com elementos de código animados -->
    <div class="background-layer" ref="bgLayer">
      <span
        v-for="(symbol, index) in symbols"
        :key="index"
        class="code-symbol"
        :style="symbol.style"
      >
        {{ symbol.text }}
      </span>
    </div>

    <!-- Conteúdo central -->
    <div class="content">
      <div class="badge" ref="badge">
        <span class="bracket">[</span>
        <span>Núcleo de Estudantes</span>
        <span class="bracket">]</span>
      </div>

      <h1 class="title" ref="title">
        <span v-for="(letter, index) in titleLetters" :key="index" class="letter">
          {{ letter }}
        </span>
      </h1>

      <p class="subtitle" ref="subtitle">TECNOLOGIAS E DESENVOLVIMENTO WEB</p>
    </div>
  </section>
</template>

<script>
import anime from 'animejs/lib/anime.es.js'
import '@/assets/home.css'

export default {
  name: 'HomeView',
  data() {
    return {
      titleLetters: ['N', 'e', 'T', 'D', 'W'],
      symbols: [],
      mouseX: 0,
      mouseY: 0,
    }
  },
  created() {
    // Gera os símbolos de fundo com posições aleatórias
    const techSymbols = [
      '</>',
      '{ }',
      '=>',
      'const',
      'let',
      'function()',
      '<div>',
      'CSS',
      'HTML',
      'JS',
      'Vue',
      'UX',
      'UI',
      'API',
      'REST',
      'git',
      'npm',
      '&&',
      '||',
      '===',
      '0101',
      '1010',
      'null',
      'undefined',
      'async',
      'await',
      'import',
      'export',
      'class',
      'return',
      'true',
      'false',
    ]

    // Aumentar a quantidade de símbolos para um efeito mais denso
    const allSymbols = [...techSymbols, ...techSymbols, ...techSymbols]

    this.symbols = allSymbols.map((text) => {
      return {
        text,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 1.5 + 0.5}rem`,
          // A opacidade inicial é 0 (definida no CSS)
        },
      }
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.animarEntrada()
      this.animarFundo()
    })
  },
  methods: {
    // Animação de entrada dos elementos centrais
    animarEntrada() {
      const tl = anime.timeline({
        easing: 'easeOutExpo',
      })

      tl.add({
        targets: this.$refs.badge,
        opacity: [0, 1],
        translateY: [-30, 0],
        translateZ: [100, 0],
        duration: 1000,
        delay: 200,
      })
        .add(
          {
            targets: '.letter',
            opacity: [0, 1],
            translateY: [80, 0],
            translateZ: [200, 0],
            rotateX: [-100, 0],
            duration: 1400,
            delay: anime.stagger(120), // Efeito em cascata nas letras
          },
          '-=800',
        )
        .add(
          {
            targets: this.$refs.subtitle,
            opacity: [0, 1],
            translateY: [30, 0],
            translateZ: [100, 0],
            duration: 1000,
          },
          '-=1000',
        )
    },

    // Animação contínua dos símbolos de fundo
    animarFundo() {
      // Seleciona todos os símbolos
      const symbols = document.querySelectorAll('.code-symbol')

      // Anima cada símbolo individualmente para que tenham ciclos independentes
      // Isto evita que a animação pare e recomece toda ao mesmo tempo
      symbols.forEach((el) => {
        anime({
          targets: el,
          opacity: [0, anime.random(0.15, 0.4), 0],
          translateY: [anime.random(-20, 20), anime.random(-60, 60)],
          translateX: [anime.random(-20, 20), anime.random(-60, 60)],
          // Usamos apenas translateZ para o efeito de profundidade/zoom, evitando o desfoque do scale
          translateZ: [anime.random(-500, -100), anime.random(100, 400)],
          duration: anime.random(4000, 8000),
          delay: anime.random(0, 5000),
          loop: true,
          easing: 'easeInOutSine',
        })
      })
    },

    // Efeito parallax com o movimento do rato
    onMouseMove(event) {
      const hero = this.$refs.hero
      if (!hero) return

      const rect = hero.getBoundingClientRect()
      // Calcula a posição do rato relativa ao centro do ecrã (-1 a 1)
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1

      // Fundo parallax
      anime({
        targets: this.$refs.bgLayer,
        translateX: x * -40,
        translateY: y * -40,
        duration: 1000,
        easing: 'easeOutQuart',
      })

      // 3D Tilt no conteúdo
      anime({
        targets: '.content',
        rotateX: y * -15, // tilt up/down
        rotateY: x * 15, // tilt left/right
        translateZ: 50,
        duration: 1000,
        easing: 'easeOutQuart',
      })
    },

    // Repõe a posição do fundo quando o rato sai
    onMouseLeave() {
      anime({
        targets: this.$refs.bgLayer,
        translateX: 0,
        translateY: 0,
        duration: 1000,
        easing: 'easeOutExpo',
      })
      anime({
        targets: '.content',
        rotateX: 0,
        rotateY: 0,
        translateZ: 0,
        duration: 1000,
        easing: 'easeOutExpo',
      })
    },
  },
}
</script>
