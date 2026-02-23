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
      
      <p class="subtitle" ref="subtitle">
        Tecnologias &amp; Desenvolvimento Web
      </p>
    </div>
  </section>
</template>

<script>
import anime from 'animejs/lib/anime.es.js'

export default {
  name: 'HomeView',
  data() {
    return {
      titleLetters: ['N', 'e', 'T', 'D', 'W'],
      symbols: [],
      mouseX: 0,
      mouseY: 0
    }
  },
  created() {
    // Gera os símbolos de fundo com posições aleatórias
    const techSymbols = [
      '</>', '{ }', '=>', 'const', 'let', 'function()', 
      '<div>', 'CSS', 'HTML', 'JS', 'Vue', 'UX', 'UI', 
      'API', 'REST', 'git', 'npm', '&&', '||', '==='
    ]
    
    this.symbols = techSymbols.map(text => {
      return {
        text,
        style: {
          left: `${Math.random() * 90 + 5}%`,
          top: `${Math.random() * 90 + 5}%`,
          fontSize: `${Math.random() * 1.5 + 0.8}rem`,
          opacity: Math.random() * 0.15 + 0.05
        }
      }
    })
  },
  mounted() {
    this.animarEntrada()
    this.animarFundo()
  },
  methods: {
    // Animação de entrada dos elementos centrais
    animarEntrada() {
      const tl = anime.timeline({
        easing: 'easeOutExpo'
      })

      tl.add({
        targets: this.$refs.badge,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800,
        delay: 200
      })
      .add({
        targets: '.letter',
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
        delay: anime.stagger(100) // Efeito em cascata nas letras
      }, '-=600')
      .add({
        targets: this.$refs.subtitle,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800
      }, '-=600')
    },

    // Animação contínua dos símbolos de fundo
    animarFundo() {
      anime({
        targets: '.code-symbol',
        translateY: () => [anime.random(-15, 15), anime.random(-30, 30)],
        translateX: () => [anime.random(-15, 15), anime.random(-30, 30)],
        scale: () => [1, anime.random(1.1, 1.3)],
        duration: () => anime.random(3000, 6000),
        delay: anime.stagger(100, { from: 'random' }),
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
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

      anime({
        targets: this.$refs.bgLayer,
        translateX: x * -30,
        translateY: y * -30,
        duration: 1000,
        easing: 'easeOutQuart'
      })
    },

    // Repõe a posição do fundo quando o rato sai
    onMouseLeave() {
      anime({
        targets: this.$refs.bgLayer,
        translateX: 0,
        translateY: 0,
        duration: 1000,
        easing: 'easeOutExpo'
      })
    }
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100svh; /* Suporte para mobile browsers */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(circle at center, #111827 0%, #0a0a0a 100%);
}

.background-layer {
  position: absolute;
  inset: -50px; /* Margem para o parallax não mostrar as bordas */
  pointer-events: none;
  z-index: 1;
}

.code-symbol {
  position: absolute;
  font-family: 'Space Mono', monospace;
  color: #38bdf8;
  user-select: none;
  will-change: transform;
}

.content {
  position: relative;
  z-index: 10;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1rem;
}

.badge {
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.75rem, 2vw, 1rem);
  color: #9ca3af;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0;
}

.bracket {
  color: #38bdf8;
  font-weight: 700;
}

.title {
  font-size: clamp(4rem, 15vw, 12rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.05em;
  display: flex;
  gap: 2px;
}

.letter {
  display: inline-block;
  background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  will-change: transform, opacity;
}

.subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  font-weight: 400;
  color: #9ca3af;
  letter-spacing: 0.05em;
  opacity: 0;
}
</style>
