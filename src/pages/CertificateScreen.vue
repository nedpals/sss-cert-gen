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
        <button v-show="imageHasLoaded" class="button is-secondary" @click="downloadCertImage">Download Image</button>
        <button v-show="imageHasLoaded" class="button is-secondary" @click="downloadCertPDF">Download PDF</button>
        <router-link to="/" class="button is-primary">Go back</router-link>
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
import { jsPDF } from 'jspdf';

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
  const fontSize = 250 - textDiff;

  ctx.font = `700 ${fontSize}px "Google Sans"`;
  ctx.fillStyle = '#374050';
  ctx.textAlign = 'center';

  // print name
  ctx.fillText(fixName(text), (canvas.value.width / 2), (canvas.value.height / 1.9) - 50);

  if (authState.participantInfo.docId) {
    // print identifier
    ctx.font = `400 50px "Google Sans"`;
    ctx.textAlign = 'left';
    ctx.fillText(`LAWIG-${authState.participantInfo.docId.toUpperCase()}`, 200, 200)
  }

  // generate download url
  certImageUrl.value = canvas.value.toDataURL('image/png');

  setTimeout(() => {
    imageHasLoaded.value = true;
  }, 200);
}

function downloadCertImage() {
  const link = document.createElement('a');
  link.download = `LAWIG Certificate - ${name}.png`;
  link.href = certImageUrl.value;
  link.click();
}

function downloadCertPDF() {
  const doc = new jsPDF('l', 'mm', 'a4');
  const name = authState.participantInfo.name!;
  const filename = `LAWIG Certificate - ${name}.pdf`;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.addImage(canvas.value, 'PNG', 0, 0, width, height, undefined, 'MEDIUM');
  doc.save(filename);
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
  font-family: "Google Sans", Arial, Helvetica, sans-serif;
  font-weight: 400;
  margin-bottom: 2.5rem;
  text-align: center;
  color: #374050;
  font-size: 2.5rem;
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
  box-shadow: 0 1.5px 10px rgba(0, 0, 0, 0.3), 0 1.5px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}

.actions {
  display: flex;
  flex-direction: column;
}

.actions .button {
  flex: 1;
  display: inline-flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  margin: 0.25rem;
}

@media screen and (min-width: 1024px) {
  .heading {
    font-size: 4rem;
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
    font-size: 4rem;
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
