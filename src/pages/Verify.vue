<template>
    <main-layout>
        <p class="lead">{{ message.length != 0 ? message : 'Verifying...' }}</p>
    </main-layout>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '../components/MainLayout.vue';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
import { collection, documentId, getDocs, limit, query, where } from '@firebase/firestore';
import { db } from '../firebase';
import { __getCurrentUser } from '../store';

const ID_REGEX = /^DSSS2023-(\S+)$/;
const router = useRouter();
const route = useRoute();
const message = ref('');
const rawCertificateId = computed(() => {
    if (!route.params.id) {
        return '';
    } else if (Array.isArray(route.params.id)) {
        return route.params.id[0];
    }
    return route.params.id;
});

async function verify() {
    try {
        if (!ID_REGEX.test(rawCertificateId.value)) {
            throw new Error('ID is invalid or was not found.');
        }

        const matched = ID_REGEX.exec(rawCertificateId.value)!;
        const certId = matched[1];

        const qry = query(collection(db, 'participants'), where(documentId(), '==', certId), limit(1));
        const resp = await getDocs(qry);
        if (resp.empty) {
            throw new Error('ID is invalid or was not found.');
        }

        const doc = resp.docs[0];
        await __getCurrentUser(doc.get('email'), true);
        await router.replace(`/cert/${rawCertificateId.value}`);
    } catch(e) {
        if (e instanceof Error) {
            message.value = e.message;
        }

        console.error(e);
    }
}

onMounted(() => {
    void verify();
})
</script>

<style scoped>
.lead {
    font-size: 4rem;
    text-align: center;
}
</style>
