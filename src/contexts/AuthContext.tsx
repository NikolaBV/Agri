import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import agent, { setAgentAuthToken } from "../api/agent";
import { LoginPayload, RegisterPayload, User } from "../api/models";
import sessionStorage from "../utils/sessionStorage";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "agri_token";
const USER_KEY = "agri_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const bootstrapSession = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        sessionStorage.getItem(TOKEN_KEY),
        sessionStorage.getItem(USER_KEY),
      ]);
      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setAgentAuthToken(storedToken);
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const persistSession = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    setToken(nextUser.token);
    setAgentAuthToken(nextUser.token);
    await Promise.all([
      sessionStorage.setItem(TOKEN_KEY, nextUser.token),
      sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser)),
    ]);
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAgentAuthToken(null);
    await Promise.all([
      sessionStorage.deleteItem(TOKEN_KEY),
      sessionStorage.deleteItem(USER_KEY),
    ]);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await agent.Accounts.login(payload);
      await persistSession(result);
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await agent.Accounts.register(payload);
      await persistSession(result);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isInitializing,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, isInitializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

