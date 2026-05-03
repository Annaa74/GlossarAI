// Stub for any `firebase/*` import during tests — pure-logic tests should
// never actually hit Firestore.
export const collection = () => ({});
export const doc = () => ({});
export const setDoc = async () => {};
export const getDoc = async () => ({ exists: () => false, data: () => ({}) });
export const getDocs = async () => ({ docs: [] });
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});
export const updateDoc = async () => {};
export const Timestamp = {
  fromDate: (d: Date) => ({ toDate: () => d }),
};
export const initializeApp = () => ({});
export const getApps = () => [];
export const getAuth = () => ({});
export const getFirestore = () => ({});
export const onAuthStateChanged = () => () => {};
export const createUserWithEmailAndPassword = async () => ({ user: {} });
export const signInWithEmailAndPassword = async () => ({ user: {} });
export const signOut = async () => {};
export const updateProfile = async () => {};
export const db = {};
export const auth = {};
export default {};
