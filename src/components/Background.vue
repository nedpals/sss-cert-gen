<template>
  <div class="bg">
    <div class="bg-top"></div>
    <div class="bg-left"></div>
    <div class="bg-right"></div>
  </div>
</template>

<script lang="ts">

export default {
  components: {
    Blob
  },
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
}

.bg-top {
  position: absolute;
  top: 0;
  background-image: url(../assets/bg-top.png);
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-position: top center;
}

.bg-left,
.bg-right {
  width: 50vw;
  height: 50vh;
  background-repeat: no-repeat;
}

.bg-left {
  position: absolute;
  bottom: 0;
  left: 0;
  background-image: url(../assets/bg-left.png);
  background-position: bottom left;
  background-size: 50%;
}

.bg-right {
  position: absolute;
  bottom: 0;
  right: 0;
  background-image: url(../assets/bg-right.png);
  background-position: bottom right;
  background-size: contain;
}
</style>
