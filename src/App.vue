<template>
  <div v-if="isPageLoading" class="page-loading-bg">
    <LoadingSpinner />
  </div>
  <div class="page-content">
    <router-view v-slot="{ Component, route }">
      <transition mode="out-in" :name="route.meta.transition || ''" :duration="{ leave: 300, enter: 1000 }">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <Background style="position: absolute;" />
</template>

<script lang="ts" setup>
import { RouterView, useRoute } from 'vue-router';
import Background from './components/Background.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import { onBeforeMount } from 'vue';
import { __getCurrentUser, isPageLoading } from './store';

const route = useRoute();

onBeforeMount(() => {
  if (route.path != '/confirm') {
    void __getCurrentUser();
  }
});
</script>

<style>
@import url('https://cdn.jsdelivr.net/gh/mortezaom/google-sans-cdn@master/fonts.css');
@import "normalize.css";

html,
body, #app {
  height: 100%;
  overflow-x: hidden;
}

body {
  color: #f8f8f2;
  background: #fff;
}

#app {
  font-family: "Google Sans", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}

.page-loading-bg {
  z-index: 999;
  background: rgba(40, 42, 54, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.page-content {
  position: relative;
}

/* Buttons */

.button {
  cursor: pointer;
  padding: 0.8rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  border: 0;
}

a.button {
  text-decoration: none;
  text-align: center;
}

.button.is-primary {
  background-color: var(--primary-color);
  background-image: linear-gradient(var(--primary-color), var(--primary-color-hover));
  color: #fff;
  border: 1px solid var(--primary-color-hover);
}

.button.is-secondary {
  color: #fff;
  background-color: var(--secondary-color);
  background-image: linear-gradient(var(--secondary-color), var(--secondary-color-hover));
}

.button.is-secondary:hover,
.button.is-secondary:focus {
  background: var(--secondary-color-hover);
}

.button.is-primary:hover,
.button.is-primary:focus {
  background: var(--primary-color-hover);
}

.button.is-danger {
  background-color: var(--danger-color);
  background-image: linear-gradient(var(--danger-color), var(--danger-color-hover));
  color: #fff;
  border: 1px solid var(--danger-color-hover);
}

.button.is-danger:hover,
.button.is-danger:focus {
  background: var(--danger-color-hover);
}

/* Fade Transition */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.75s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
