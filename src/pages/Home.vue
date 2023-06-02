<template>
  <div class="container">
    <img src="../assets/logo.png" class="logo">
    <section class="card">
      <div v-show="state.isProcessing" class="card-loading-spinner">
        <LoadingSpinner />
      </div>
      <h2>Claim your certificate</h2>

      <form v-if="state.isEmailSent" class="section" @submit="($e) => void login($e)">
        <label for="got_name">As a final step, please enter the first name you provided in the registration form.</label>
        <input
          v-model="state.gotName"
          type="text"
          name="got_name"
          id="got_name"
          title="First name"
          required
          :disabled="state.isProcessing" />
        <span v-if="state.msg.length != 0" class="input-warning">{{ state.msg }}</span>
        <span v-else class="input-hint">Input is case-insensitive</span>
        <button type="submit" class="button is-primary">Submit</button>
        <button class="button is-danger" @click="clearForm">Go back</button>
      </form>

      <form v-else-if="!authState.isAuthenticated" class="sign-in-form" @submit="($e) => void verify($e)">
        <label for="email">Enter your e-mail</label>
        <input
          v-model="state.email"
          type="email"
          name="email"
          id="email"
          title="Please enter a valid e-mail address."
          placeholder="johndoe@example.com"
          required
          :disabled="state.isProcessing" />
        <span v-if="state.msg.length != 0" class="input-warning">{{ state.msg }}</span>
        <span v-else class="input-hint">Hint! Use the e-mail address you have used when signing up for the event.</span>
        <button class="button is-primary" :disabled="state.isProcessing">Sign in</button>
      </form>

      <section v-else class="section">
        <p>You are currently signed in as <b>{{ authState.participantInfo.email }}</b>.</p>

        <router-link class="button is-secondary" to="/cert">Claim certificate</router-link>
        <button class="button is-danger" @click="logout" :disabled="state.isProcessing">Sign out</button>
      </section>
    </section>

    <img src="../assets/presentor_logos.png" class="presenter-logos" alt="Davao JS, DSC UIC, UIC SITES">
  </div>
</template>

<script lang="ts" setup>
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { authState, logout } from '../store';
import { reactive } from 'vue';
import { __getCurrentUser } from '../store';

const state = reactive({
  email: null as string | null,
  isProcessing: false,
  isEmailSent: false,
  gotName: '',
  msg: ''
});

function clearForm() {
  state.isEmailSent = false;
  state.email = null;
  state.gotName = '';
  state.msg = '';
}

async function participantExists() {
  if (!state.email) return false;
  const qry = query(collection(db, 'participants'), where('email', '==', state.email));

  try {
    const doc = await getDocs(qry);
    // false if empty, true if not
    return !doc.empty;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function login(e: Event) {
  e.preventDefault();

  if (!state.isEmailSent || !state.gotName || !state.email) return;

  state.isProcessing = true;

  try {
    const qry = query(collection(db, 'participants'), where('email', '==', state.email));
    const docs = await getDocs(qry);
    const firstDoc = docs.docs[0];

    const name = firstDoc.get('name') as string;
    if (!name.toLowerCase().startsWith(state.gotName.toLowerCase())) {
      throw new Error('Input not matched. Be sure to double-check if the spelling is correct.');
    }

    // separate view
    await __getCurrentUser(state.email);
    clearForm();
  } catch(e) {
    console.error(e);

    if (e instanceof Error) {
      state.msg = e.message;
    }
  } finally {
    state.isProcessing = false;
  }
}

async function verify(e: Event) {
  e.preventDefault();

  if (!state.email) return;

  state.isProcessing = true;

  if (await participantExists()) {
    try {
      // separate view
      state.isEmailSent = true;
    } catch(e) {
      console.error(e);
      if (e instanceof Error) {
        state.msg = e.message;
      }
    } finally {
      state.isProcessing = false;
    }
  } else {
    state.isProcessing = false;
    state.msg = `E-mail ${state.email} was not found in our records! Please double check your e-mail.`;
  }
}
</script>

<style scoped>
.container {
  height: 83vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3.5rem 0;
}

.logo {
  width: 10rem;
  margin-bottom: 3rem;
}

.card {
  position: relative;
  background: #fff;
  width: 75%;
  color: #000;
  border: 1px solid rgba(0, 0, 0, 0.184);
  border-radius: 10px;
  padding: 2rem 1.8rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.card .card-loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.23), 0 3px 12px rgba(0, 0, 0, 0.16);
}
.card h2 {
  text-align: center;
  margin-top: 0;
}

.section {
  display: flex;
  flex-direction: column;
  text-align: center;
  word-break: break-word;
}

.section .button:not(:last-child) {
  margin-bottom: 0.5rem;
}

.sign-in-form {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

label[for="email"],
label[for="got_name"] {
  text-align: left;
  margin-bottom: 0.5rem;
  color: rgb(50, 50, 50);
}

input {
  padding: 0.8rem 1rem;
  border-radius: 4px;
  border: rgba(0, 0, 0, 0.5) 1px solid;
  margin-bottom: 0.5rem;
}

.input-warning,
.input-hint {
  margin-bottom: 1rem;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
}

.input-warning {
  color: var(--danger-color);
}

.input-hint {
  color: rgb(117, 117, 117);
}

.presenter-logos {
  width: 75%;
  margin-top: auto;
}

@media screen and (min-width: 640px) {
  .logo {
    width: 25rem;
  }

  .card {
    width: 20rem;
  }

  .presenter-logos {
    width: 50%;
  }
}

@media screen and (min-width: 1024px) {
  .logo {
    width: 20rem;
  }

  .card {
    width: 30%;
  }

  .presenter-logos {
    width: 35%;
  }
}

@media screen and (min-width: 1280px) {
  .card {
    width: 23rem;
  }

  .presenter-logos {
    width: 25%;
  }
}
</style>
