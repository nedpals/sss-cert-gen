import { reactive, ref } from 'vue';
import { auth, db, getCurrentUser } from './firebase';

// state management
import { signOut } from 'firebase/auth';
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

  await signOut(auth);

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

export async function __getCurrentUser() {
  try {
    if (authState.isAuthenticated) {
      togglePageLoading(false);
      return true;
    }

    const user = await getCurrentUser();
    if (user && user.emailVerified) {
      // get user details
      const qry = query(collection(db, 'participants'), where('email', '==', user.email), limit(1));
      const querySnapshot = await getDocs(qry);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];

        authState.isAuthenticated = true;
        authState.participantInfo = {
          docId: doc.id ?? null,
          email: user.email,
          name: doc.get('name'),
          hasClaimed: doc.get('hasClaimed') ?? false
        }
      }
    } else {
      throw Error('Not logged in!');
    }
  } catch (e) {
    authState.isAuthenticated = false;
  } finally {
    togglePageLoading(false);
    return authState.isAuthenticated;
  }
}
