// Suppress the [error] / [event] / [firebase] noise our observability layer
// emits — the tests deliberately exercise error paths.
import {
  mapAuthError,
  signUp,
  signIn,
  signInWithGoogleIdToken,
  deleteAccount,
  resendVerificationEmail,
} from '../services/auth';

import * as firebaseMock from './__mocks__/firebase-empty';

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

// Shared mock auth object the tests can mutate (e.g. set currentUser before
// calling deleteAccount). Must be declared before jest.mock — `mock`-prefixed
// names are allowlisted by jest's hoisted-factory rule.
const mockAuth: { currentUser: unknown } = { currentUser: null };
const mockDb = {};

jest.mock('../services/firebase', () => ({
  auth: mockAuth,
  db: mockDb,
}));

const fb = firebaseMock as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  // Reset every jest.fn() between tests to keep mockResolvedValueOnce calls
  // from leaking. Defaults are restored from the mock module itself when it
  // re-runs the factory; here we just clear call history.
  Object.values(firebaseMock).forEach((value) => {
    if (typeof value === 'function' && 'mockClear' in value) {
      (value as jest.Mock).mockClear();
    }
  });
  mockAuth.currentUser = null;
});

describe('mapAuthError', () => {
  it.each([
    ['auth/invalid-email', /invalid/i],
    ['auth/invalid-credential', /incorrect/i],
    ['auth/wrong-password', /incorrect/i],
    ['auth/user-not-found', /incorrect/i],
    ['auth/email-already-in-use', /already exists/i],
    ['auth/weak-password', /too weak/i],
    ['auth/too-many-requests', /too many/i],
    ['auth/network-request-failed', /offline/i],
    ['auth/user-disabled', /disabled/i],
    ['auth/requires-recent-login', /sign in again/i],
    ['auth/popup-closed-by-user', /cancelled/i],
    ['auth/expired-action-code', /expired/i],
  ])('maps %s to a friendly string', (code, pattern) => {
    expect(mapAuthError({ code })).toMatch(pattern);
  });

  it('falls back to a generic message when the code is unknown', () => {
    expect(mapAuthError({ code: 'auth/something-new' })).toMatch(/went wrong/i);
  });

  it('never leaks the raw Firebase message even when it is present', () => {
    expect(mapAuthError({ code: 'auth/unknown', message: 'Firebase: nope' })).not.toMatch(
      /Firebase:/
    );
  });
});

describe('signUp', () => {
  it('creates auth user, sends verification email, and writes Firestore profile', async () => {
    const fakeUser = {
      uid: 'u-new',
      email: 'new@example.com',
      displayName: null,
      emailVerified: false,
      reload: jest.fn(),
    };
    fb.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: fakeUser });
    fb.updateProfile.mockResolvedValueOnce(undefined);
    fb.sendEmailVerification.mockResolvedValueOnce(undefined);
    fb.setDoc.mockResolvedValueOnce(undefined);

    const user = await signUp('new@example.com', 'pw12345678', 'Newbie');

    expect(fb.createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(fb.updateProfile).toHaveBeenCalledWith(fakeUser, { displayName: 'Newbie' });
    expect(fb.sendEmailVerification).toHaveBeenCalledWith(fakeUser);
    expect(fb.setDoc).toHaveBeenCalled();
    expect(user.id).toBe('u-new');
    expect(user.displayName).toBe('Newbie');
    expect(user.emailVerified).toBe(false);
  });

  it('does not throw if sendEmailVerification rate-limits at signup time', async () => {
    fb.createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'u', email: 'a@b.c', displayName: null, emailVerified: false },
    });
    fb.sendEmailVerification.mockRejectedValueOnce(
      Object.assign(new Error('rate limit'), { code: 'auth/too-many-requests' })
    );

    await expect(signUp('a@b.c', 'pw12345678', 'A B')).resolves.toBeDefined();
  });
});

describe('signIn', () => {
  it('returns user from existing Firestore doc when present', async () => {
    fb.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'u-existing',
        email: 'old@example.com',
        emailVerified: true,
        displayName: 'Old',
      },
    });
    fb.getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        email: 'old@example.com',
        displayName: 'Old',
        streak: 5,
        lastStudyDate: '2024-01-01T00:00:00.000Z',
        notificationSettings: { enabled: true, reminderTime: '09:00', frequency: 'daily' },
        createdAt: '2023-06-01T00:00:00.000Z',
      }),
    });

    const user = await signIn('old@example.com', 'pw');
    expect(user.id).toBe('u-existing');
    expect(user.streak).toBe(5);
    expect(user.emailVerified).toBe(true);
    // Critically: signIn should NOT write a doc when one already exists.
    expect(fb.setDoc).not.toHaveBeenCalled();
  });

  it('backfills a Firestore doc when none exists yet (legacy account)', async () => {
    fb.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'u-legacy',
        email: 'legacy@example.com',
        displayName: null,
        emailVerified: true,
      },
    });
    fb.getDoc.mockResolvedValueOnce({ exists: () => false, data: () => ({}) });

    const user = await signIn('legacy@example.com', 'pw');
    expect(fb.setDoc).toHaveBeenCalledTimes(1);
    expect(user.displayName).toBe('legacy'); // falls back to email prefix
  });
});

describe('signInWithGoogleIdToken', () => {
  it('marks Google users as email-verified by default', async () => {
    fb.signInWithCredential.mockResolvedValueOnce({
      user: {
        uid: 'g-1',
        email: 'g@example.com',
        displayName: 'G User',
        emailVerified: true,
      },
    });
    fb.getDoc.mockResolvedValueOnce({ exists: () => false, data: () => ({}) });

    const user = await signInWithGoogleIdToken('id-token-here');
    expect(user.emailVerified).toBe(true);
    expect(user.id).toBe('g-1');
  });
});

describe('deleteAccount', () => {
  it('deletes Firestore doc BEFORE auth user (so the doc cannot be orphaned)', async () => {
    const fakeUser = {
      uid: 'u-del',
      email: 'del@example.com',
      emailVerified: true,
    };
    mockAuth.currentUser = fakeUser;

    const callOrder: string[] = [];
    fb.reauthenticateWithCredential.mockImplementationOnce(async () => {
      callOrder.push('reauth');
      return {};
    });
    fb.deleteDoc.mockImplementationOnce(async () => {
      callOrder.push('deleteDoc');
    });
    fb.deleteUser.mockImplementationOnce(async () => {
      callOrder.push('deleteUser');
    });

    await deleteAccount('current-pw');
    expect(callOrder).toEqual(['reauth', 'deleteDoc', 'deleteUser']);
  });

  it('throws a recognisable error when not signed in', async () => {
    mockAuth.currentUser = null;
    await expect(deleteAccount('pw')).rejects.toThrow(/not signed in/i);
  });
});

describe('resendVerificationEmail', () => {
  it('no-ops when the user is already verified', async () => {
    mockAuth.currentUser = { emailVerified: true };
    await resendVerificationEmail();
    expect(fb.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('throws when no user is signed in', async () => {
    mockAuth.currentUser = null;
    await expect(resendVerificationEmail()).rejects.toThrow(/not signed in/i);
  });
});
