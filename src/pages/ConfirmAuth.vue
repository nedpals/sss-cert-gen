<template>
  <p>{{ msg }}</p>
</template>

<script lang="ts">
import { browserLocalPersistence, isSignInWithEmailLink, setPersistence, signInWithEmailLink } from '@firebase/auth';
import { auth } from '../firebase';
import { __getCurrentUser, togglePageLoading } from '../store';

export default {
  mounted() {
    this.verifyConfirmationLink()
      .then(() => {});
  },
  data() {
    return {
      msg: ''
    }
  },
  methods: {
    async verifyConfirmationLink() {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          await setPersistence(auth, browserLocalPersistence);

          togglePageLoading(true);
          let email = window.localStorage.getItem('emailForSignIn');
          if (!email) {
            email = window.prompt('Please provide your email for confirmation');
          }

          await signInWithEmailLink(auth, email!, window.location.href);
          window.localStorage.removeItem('emailForSignIn');

          await __getCurrentUser();
          this.$router.replace('/');
        } else {
          throw new Error('Whoops!');
        }
      } catch(e) {
        togglePageLoading(false);
        console.error(e);
        this.msg = 'Invalid confirmation code. Redirecting back...';

        setTimeout(() => {
          this.$router.replace('/');
        }, 1000);
      }
    }
  }
}
</script>
