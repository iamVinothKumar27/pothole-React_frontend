import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import apiClient from "../api/client";
import { clearGoogleSession, loadGoogleSession, saveGoogleSession } from "../lib/googleSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [googleSession, setGoogleSession] = useState(() => loadGoogleSession());
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
    });
    return unsubscribe;
  }, []);

  // Firebase (email/password) and Google OAuth are independent identity
  // sources now — Google sign-in no longer touches Firebase at all.
  const currentUser = firebaseUser || googleSession;

  useEffect(() => {
    let cancelled = false;
    if (!currentUser) {
      setProfile(null);
      setProfileLoading(false);
      return undefined;
    }
    setProfileLoading(true);
    apiClient
      .get("/api/me")
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfile(null);
        // Our backend-issued session token is only valid for ~1 hour and
        // this app doesn't silently refresh it — once the backend rejects
        // it, drop the stale local session instead of leaving the UI stuck
        // showing "signed in" while every API call 401s.
        if (err?.response?.status === 401 && googleSession) {
          clearGoogleSession();
          setGoogleSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, googleSession]);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    return credential;
  };

  // Called with the OAuth access token handed back by Google Identity
  // Services' token client. Exchanges it for a session token our own
  // backend issues after verifying the access token directly against the
  // Google Cloud OAuth client (see /api/auth/google) — Firebase is never
  // involved in this path.
  const loginWithGoogle = async (accessToken) => {
    const { data } = await apiClient.post("/api/auth/google", { access_token: accessToken });
    const session = { credential: data.token, exp: data.exp, email: data.email, name: data.name };
    saveGoogleSession(session);
    // Set profileLoading in the same batch as the session update so
    // `loading` flips true immediately — otherwise there's a render where
    // currentUser is already truthy but profile is still the old (null)
    // value, and a consumer routing on isAdmin (e.g. Login's post-auth
    // redirect) would act on that stale false before /api/me resolves.
    setProfileLoading(true);
    setGoogleSession(session);
  };

  const logout = async () => {
    if (firebaseUser) await signOut(auth);
    if (googleSession) {
      clearGoogleSession();
      setGoogleSession(null);
    }
  };

  const getIdToken = () => {
    if (firebaseUser) return firebaseUser.getIdToken();
    if (googleSession) return Promise.resolve(googleSession.credential);
    return Promise.resolve(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      isAdmin: Boolean(profile?.is_admin),
      loading: firebaseLoading || profileLoading,
      login,
      loginWithGoogle,
      signup,
      logout,
      getIdToken,
    }),
    [currentUser, profile, firebaseLoading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
