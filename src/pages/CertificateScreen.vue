<template>
  <section class="cert-page" v-show="!isPageLoading">
    <h2 class="heading">Here's your certificate!</h2>
    <transition name="slide-card">
      <div
        v-show="imageHasLoaded"
        :style="certificateImgCss" class="cert"
      ></div>
    </transition>
    <div class="cert-padding"></div>
    <transition name="fade">
      <div class="actions">
        <button v-show="imageHasLoaded" class="button is-primary" @click="downloadCertImage">Download Image</button>
        <router-link to="/" class="button is-secondary">Go back</router-link>
      </div>
    </transition>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import certImageTemplateUrl from '../assets/cert.png';
import { nameCase as namecase } from '@foundernest/namecase';
import { authState, isPageLoading, setAsClaimed } from '../store';
import { computed } from '@vue/reactivity';

const img = ref(new Image());
const imageHasLoaded = ref(false);
const canvas = ref(document.createElement('canvas'));
const certImageUrl = ref('');
const certificateImgCss = computed(() => `background-image: url(${certImageUrl.value});`);

function onImgLoad() {
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  canvas.value.height = img.value.height;
  canvas.value.width = img.value.width;

  ctx.drawImage(img.value, 0, 0, img.value.width, img.value.height);
  const text = authState.participantInfo.name!;

  // for recalculating the font size.
  const textDiff = text.length > 21 ? text.length - 21 + 5 : 0;
  const fontSize = 80 - textDiff;

  ctx.font = `700 ${fontSize}px "Quicksand"`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  // print name
  ctx.fillText(fixName(text), (canvas.value.width / 2) + 200, (canvas.value.height / 1.9) - 100);

  // generate download url
  certImageUrl.value = canvas.value.toDataURL('image/png');

  setTimeout(() => {
    imageHasLoaded.value = true;
  }, 200);
}

function downloadCertImage() {
  const link = document.createElement('a');
  const name = authState.participantInfo.name!;
  link.download = `Certificate - ${name}.png`;
  link.href = certImageUrl.value;
  link.click();
}

function fixName(name: string) {
  // FIXME: better algo for this ;--;
  let finalName = name;
  try {
    // search for apostrophes
    let nameArr = finalName.split(',');
    const deleted = nameArr.splice(0, 1);
    if (deleted.length == 0) {
      throw new Error('Last name not found!');
    }
    nameArr = nameArr.concat(deleted[0]).map(n => n.trimLeft()).join(' ').split(' ');

    // fix suffixes
    const suffixRegex = /^[JSjs][rR]$/g;
    const initialsRegex = /^[A-Za-z]{1}.$/g;
    if (suffixRegex.test(nameArr[nameArr.length - 1])) {
      nameArr[nameArr.length - 1] += '.';
    } else if (initialsRegex.test(nameArr[nameArr.length - 1])) {
      const deleted2 = nameArr.splice(0, 1);
      if (deleted2.length == 0) {
        throw new Error('Last name not found!');
      }
      nameArr = nameArr.concat(deleted2[0]);
    } else {
      const initialsRegex2 = /^[A-Za-z]{1}$/g;
      for (let i = 0; i < nameArr.length; i++) {
        if (initialsRegex2.test(nameArr[i])) {
          nameArr[i] += '.';
        }
      }
    }
    finalName = nameArr.join(' ');
    return finalName.endsWith('De Vera') ? finalName : namecase(finalName);
  } catch(e) {
    // this catch block should not do anything
    // but print harmless messages
    console.error(e);
    return namecase(finalName);
  }
}

onMounted(() => {
  img.value.src = certImageTemplateUrl;
  img.value.addEventListener('load', onImgLoad, false);

  void setAsClaimed();
});

onUnmounted(() => {
  img.value.removeEventListener('load', onImgLoad);
});
</script>

<style scoped>
.heading {
  font-family: "Syncopate", Arial, Helvetica, sans-serif;
  font-weight: 400;
  margin-bottom: 2rem;
  text-align: center;
}

@keyframes slide-card {
  0% {
    transform: rotate(-180deg) translate(-100%, 150%);
  }
  100% {
    transform: rotate(3deg) translate(0%, 0%);
  }
}

/* Use fade transition for slide-card */

.slide-card-enter-active,
.slide-card-leave-active {
  transition: opacity 0.75s ease;
}

.slide-card-enter-from,
.slide-card-leave-to {
  opacity: 0;
}

.cert-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: 700px;
  padding: 0 1.5rem;
}

.cert-padding {
  /* display: none; */
  padding-top: calc(141.42% / 16);
}

.cert {
  /* aspect-ratio padding hack. the ratio of a4 is 1:1.4142 */
  padding-top: calc(141.42% / 2);
  transform-origin: top left;
  margin: 0;
  border: 4px solid #fff;
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: 0 1.5px 10px rgba(0, 0, 0, 0.6), 0 1.5px 12px rgba(0, 0, 0, 0.6);
  position: relative;
}

.actions {
  display: flex;
}

.actions .button {
  flex: 1;
  display: inline-flex;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.actions .button:not(:last-child) {
  margin-right: 0.5rem;
}

@media screen and (min-width: 1024px) {
  .heading {
    font-size: 2.5rem;
  }
}

@media screen and (min-width: 1280px) {
  .cert-page {
    max-width: 900px;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 2rem;
  }

  .heading {
    font-size: 3.3rem;
  }

  .slide-card-enter-active {
    overflow: hidden;
    animation-name: slide-card;
    animation-duration: 800ms;
  }

  .slide-card-leave-active {
    overflow: hidden;
    animation-name: slide-card;
    animation-duration: 600ms;
    animation-direction: reverse;
  }

  .cert-padding {
    display: block;
    padding-top: calc(141.42% / 1.8);
  }

  .cert {
    padding-top: 0;
    height: 620px;
    width: 877px;
    top: 14%;
    left: 0;
    position: absolute;
    transform: rotate(3deg) translate(0%, 0%);
  }

  .slide-card-enter-from,
  .slide-card-leave-to {
    /* noop */
  }
}
</style>
