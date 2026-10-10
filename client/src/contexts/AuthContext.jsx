import { createContext, useContext, useEffect, useState } from 'react';
import { auth, loginWithGoogle, logout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no firebase config is present, we mock a user for development
    if (import.meta.env.VITE_FIREBASE_API_KEY === undefined) {
      console.warn("⚠️ Firebase config missing. Using MOCK user for development.");
      setUser({ uid: 'mock-user-123', email: 'test@example.com', displayName: 'Ash Ketchum' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getToken = async () => {
    if (import.meta.env.VITE_FIREBASE_API_KEY === undefined) {
      return 'mock-token-123';
    }
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    loginWithGoogle,
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
