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
        <a v-show="imageHasLoaded && route.name !== 'cert-with-id-page'" :href="linkedInShareUrl" target="_blank" class="button is-linkedin">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20.47 2H3.53a1.45 1.45 0 0 0-1.47 1.43v17.14A1.45 1.45 0 0 0 3.53 22h16.94a1.45 1.45 0 0 0 1.47-1.43V3.43A1.45 1.45 0 0 0 20.47 2ZM8.09 18.74h-3v-9h3ZM6.59 8.48a1.56 1.56 0 1 1 0-3.12a1.57 1.57 0 1 1 0 3.12Zm12.32 10.26h-3v-4.83c0-1.21-.43-2-1.52-2A1.65 1.65 0 0 0 12.85 13a2 2 0 0 0-.1.73v5h-3v-9h3V11a3 3 0 0 1 2.71-1.5c2 0 3.45 1.29 3.45 4.06Z"/>
          </svg>
          Add to LinkedIn
        </a>
        <router-link v-if="!authState.participantInfo.fromVerify" to="/" class="button is-primary">Go back</router-link>
      </div>
    </transition>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import certImageTemplateUrl from '../assets/cert.png';
import { nameCase as namecase } from '@foundernest/namecase';
import { authState, isPageLoading, logout, setAsClaimed } from '../store';
import { computed } from '@vue/reactivity';
import { jsPDF } from 'jspdf';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const img = ref(new Image());
const imageHasLoaded = ref(false);
const canvas = ref(document.createElement('canvas'));
const certImageUrl = ref('');
const certificateImgCss = computed(() => `background-image: url(${certImageUrl.value});`);
const certId = computed(() => `DSSS2023-${authState.participantInfo.docId}`);
const linkedInShareUrl = computed(() => {
  // const orgName = 'DICE - Davao Interschool Computer Enthusiasts';
  const orgId = '96606526';
  const certTitle = '1st Davao Student Startup Summit 2023: Sparking Insights and Ideas for Your Next Innovation';
  const certYear = 2023;
  const certMonth = 9;
  const certURL = window.location.origin + `/verify/${certId.value}`;
  return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&organizationId=${encodeURI(orgId)}&name=${certTitle}&issueYear=${certYear}&issueMonth=${certMonth}&certUrl=${certURL}&certId=${certId.value}`;
});

if (route.name === 'cert-with-id-page' && !authState.participantInfo.fromVerify) {
  // Go first to verify page to make sure the
  // certificate data of participant data is loaded
  router.replace({ name: 'verify-page', params: { id: route.params.id } });
}

function generateFileName(ext: string) {
  const prefix = 'DSSS2023 Certificate';
  const extWithDot = '.' + ext;
  if (!authState.participantInfo.name) {
    return prefix + extWithDot;
  }
  const name = authState.participantInfo.name!;
  return `${prefix} - ${name}${extWithDot}`;
}

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

  ctx.font = `700 ${fontSize}px "Montserrat"`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  // print name
  ctx.fillText(fixName(text), (canvas.value.width / 2), (canvas.value.height * 0.49) - 50);

  if (authState.participantInfo.docId) {
    ctx.fillStyle = '#333333';
    // print identifier
    ctx.font = `400 20px "Montserrat"`;
    ctx.textAlign = 'left';
    ctx.fillText(certId.value, 50, 950)
  }

  // generate download url
  certImageUrl.value = canvas.value.toDataURL('image/png');

  setTimeout(() => {
    imageHasLoaded.value = true;
  }, 200);
}

function downloadCertImage() {
  const link = document.createElement('a');
  link.download = generateFileName('png');
  link.href = certImageUrl.value;
  link.click();
}

function downloadCertPDF() {
  const doc = new jsPDF('l', 'mm', 'a4');
  const filename = generateFileName('pdf');
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

onBeforeRouteLeave(async (to) => {
  if (authState.isAuthenticated && authState.participantInfo.fromVerify && to) {
    // DO NOT ACCIDENTALLY "LEAK" DETAILS!
    await logout();
  }
});

onMounted(() => {
  img.value.src = certImageTemplateUrl;
  img.value.addEventListener('load', onImgLoad, false);

  // Avoid setting hasClaimed if the user is
  // viewing at /cert/<id> instead of just /cert
  if (route.name !== 'cert-with-id-page') {
    void setAsClaimed();
  }
});

onUnmounted(() => {
  img.value.removeEventListener('load', onImgLoad);
});
</script>

<style scoped>
.heading {
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-align: center;
  color: #fff;
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

.button.is-linkedin {
  --linkedin-color: #0a66c2;
  --linkedin-color-hover: #0858a7;

  padding: 0.4rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--linkedin-color);
  background-image: linear-gradient(var(--linkedin-color), var(--linkedin-color-hover));
  color: #fff;
  border: 1px solid var(--linkedin-color-hover);
}

.button.is-linkedin:hover,
.button.is-linkedin:focus {
  background: var(--linkedin-color-hover);
}

.button.is-linkedin svg {
  width: 1.5rem;
  margin-top: -0.1rem;
  margin-right: 0.4rem;
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
