import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { getTwitterStatus } from "@/lib/twitter-api";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isTwitterConnected: boolean;
  signInWithTwitter: () => Promise<void>;
  signOut: () => Promise<void>;
  checkTwitterStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

  // Check session on mount
  useEffect(() => {
    authClient
      .getSession()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user as User);
        }
      })
      .catch(() => {
        // Not logged in
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Check twitter status when user changes
  const checkTwitterStatus = useCallback(async () => {
    if (!user) {
      setIsTwitterConnected(false);
      return;
    }
    try {
      const status = await getTwitterStatus();
      setIsTwitterConnected(status.connected);
    } catch {
      setIsTwitterConnected(false);
    }
  }, [user]);

  useEffect(() => {
    checkTwitterStatus();
  }, [checkTwitterStatus]);

  const signInWithTwitter = useCallback(async () => {
    await authClient.signIn.social({
      provider: "twitter",
      callbackURL: window.location.href,
    });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setIsTwitterConnected(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isTwitterConnected,
        signInWithTwitter,
        signOut,
        checkTwitterStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
