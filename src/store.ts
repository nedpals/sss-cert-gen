import { reactive, ref } from 'vue';
import { db } from './firebase';

// state management
import { collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';

export const isPageLoading = ref(false);
export const authState = reactive({
  isAuthenticated: false,
  participantInfo: {
    docId: null,
    email: null,
    name: null,
    hasClaimed: false
  } as {
    docId: string | null
    email: string | null
    name: string | null
    hasClaimed: boolean
  }
});

export function togglePageLoading(newState: boolean) {
  isPageLoading.value = newState;
}

export async function logout() {
  if (!authState.isAuthenticated) {
    return;
  }

  togglePageLoading(true);

  authState.isAuthenticated = false;
  authState.participantInfo = {
    email: null,
    name: null,
    docId: null,
    hasClaimed: false
  }

  togglePageLoading(false);
}

export async function setAsClaimed() {
  if (!authState.participantInfo.docId || authState.participantInfo.hasClaimed) {
    return;
  }

  const docRef = doc(db, 'participants', authState.participantInfo.docId);
  await updateDoc(docRef, { hasClaimed: true });
}

export async function __getCurrentUser(email: string) {
  try {
    if (authState.isAuthenticated) {
      togglePageLoading(false);
      return true;
    }

    const qry = query(collection(db, 'participants'), where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(qry);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];

      authState.isAuthenticated = true;
      authState.participantInfo = {
        docId: doc.id ?? null,
        email: doc.get('email'),
        name: doc.get('name'),
        hasClaimed: doc.get('hasClaimed') ?? false
      }
    }
  } catch (e) {
    authState.isAuthenticated = false;
  } finally {
    togglePageLoading(false);
    return authState.isAuthenticated;
  }
}
