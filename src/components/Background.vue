<template>
  <div class="bg"></div>
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
}

.blobs {
  position: relative;
  height: 100%;
}

.blob-1,
.blob-2,
.blob-1-fallback,
.blob-2-fallback {
  position: absolute;
}

.blob-1,
.blob-2 {
  top: 0;
  display: none;
}

.blob-1,
.blob-1-fallback {
  left: 0;
}

.blob-2,
.blob-2-fallback {
  right: 0;
}

.blob-1-fallback,
.blob-2-fallback {
  height: 100vh;
  width: 100vw;
}

.blob-1-fallback {
  bottom: 0;
  background: url(../assets/bottom_left_wave_fallback.png) no-repeat;
  background-position: bottom left;

}

.blob-2-fallback {
  top: 0;
  background: url(../assets/top_right_wave_fallback.png) no-repeat;
  background-position: top right;
}

@media screen and (min-width: 1280px) {
  .blob-1-fallback,
  .blob-2-fallback {
    display: none;
  }

  .blob-1,
  .blob-2 {
    display: block;
  }
}
</style>
