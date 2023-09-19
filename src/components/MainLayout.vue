<template>
    <div class="container">
        <img src="../assets/logo.png" class="logo">
        <slot></slot>
        <img src="../assets/presentor_logos.png" class="presenter-logos" alt="Davao Interschool Computer Enthusiasts">
    </div>
</template>

<style scoped>
.container {
  height: 83vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3.5rem 0;
}

.logo {
  width: 25rem;
  margin-bottom: 3rem;
}

.presenter-logos {
  width: 75%;
  margin-top: auto;
}

@media screen and (min-width: 640px) {
  .logo {
    width: 25rem;
  }

  .presenter-logos {
    width: 50%;
  }
}

@media screen and (min-width: 1024px) {
  .logo {
    width: 20rem;
  }

  .presenter-logos {
    width: 35%;
  }
}

@media screen and (min-width: 1280px) {
  .presenter-logos {
    width: 25%;
  }
}
</style>
