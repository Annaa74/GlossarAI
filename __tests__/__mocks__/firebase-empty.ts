// Stub for any `firebase/*` import during tests — pure-logic tests should
// never actually hit Firestore. Each function is a jest.fn() so individual
// tests can override behaviour via mockResolvedValueOnce / mockReturnValueOnce
// without disturbing other suites.
//
// Defaults are tuned so callers of the mocked Firestore see "doc does not
// exist, no data" — matching the previous static stubs.

export const collection = jest.fn(() => ({}));
export const doc = jest.fn(() => ({}));
export const setDoc = jest.fn(async () => {});
export const getDoc = jest.fn(async () => ({ exists: () => false, data: () => ({}) }));
export const getDocs = jest.fn(async () => ({ docs: [] }));
export const deleteDoc = jest.fn(async () => {});
export const query = jest.fn(() => ({}));
export const where = jest.fn(() => ({}));
export const orderBy = jest.fn(() => ({}));
export const limit = jest.fn(() => ({}));
export const updateDoc = jest.fn(async () => {});
export const Timestamp = {
  fromDate: (d: Date) => ({ toDate: () => d }),
};
export const initializeApp = jest.fn(() => ({}));
export const getApps = jest.fn(() => []);
export const getAuth = jest.fn(() => ({ currentUser: null }));
export const initializeAuth = jest.fn(() => ({ currentUser: null }));
export const getFirestore = jest.fn(() => ({}));
export const onAuthStateChanged = jest.fn(() => () => {});

// Auth method mocks
export const createUserWithEmailAndPassword = jest.fn(async () => ({
  user: {
    uid: 'mock-uid',
    email: 'mock@example.com',
    displayName: null,
    emailVerified: false,
    reload: jest.fn(async () => {}),
  },
}));
export const signInWithEmailAndPassword = jest.fn(async () => ({
  user: {
    uid: 'mock-uid',
    email: 'mock@example.com',
    displayName: 'Mock',
    emailVerified: true,
    reload: jest.fn(async () => {}),
  },
}));
export const signOut = jest.fn(async () => {});
export const updateProfile = jest.fn(async () => {});
export const sendEmailVerification = jest.fn(async () => {});
export const sendPasswordResetEmail = jest.fn(async () => {});
export const updatePassword = jest.fn(async () => {});
export const verifyBeforeUpdateEmail = jest.fn(async () => {});
export const reauthenticateWithCredential = jest.fn(async () => ({}));
export const deleteUser = jest.fn(async () => {});
export const signInWithCredential = jest.fn(async () => ({
  user: {
    uid: 'mock-google-uid',
    email: 'google@example.com',
    displayName: 'Google User',
    emailVerified: true,
    reload: jest.fn(async () => {}),
  },
}));

export const EmailAuthProvider = {
  credential: jest.fn(() => ({})),
};
export const GoogleAuthProvider = {
  credential: jest.fn(() => ({})),
};

export const db = {};
export const auth = { currentUser: null };

export default {};
