<template>
  <div class="bg">
  </div>
</template>

<script lang="ts">

export default {
  created() {
    window.addEventListener('resize', this.setWidths);
  },
  unmounted() {
    window.removeEventListener('resize', this.setWidths);
  },
  data() {
    return {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    }
  },
  methods: {
    setWidths() {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    },
  }
}
</script>

<style scoped>
.bg {
  z-index: -1;
  top: 0;
  left:0;
  height: 100vh;
  width: 100vw;
  position: relative;
  background-position-x: center;
  background-position-y: -80px;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url(../assets/bg.png);
}
</style>
