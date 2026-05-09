import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";
import { attachAuthHandlers } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("store-rating-auth");
      return raw ? JSON.parse(raw) : { token: null, user: null };
    } catch {
      localStorage.removeItem("store-rating-auth");
      return { token: null, user: null };
    }
  });

  const logout = () => {
    localStorage.removeItem("store-rating-auth");
    setAuth({ token: null, user: null });
  };

  useEffect(() => {
    attachAuthHandlers(() => auth.token, logout);
  }, [auth.token]);

  const value = useMemo(() => ({
    ...auth,
    role: auth.user?.role,
    async login(payload) {
      const { data } = await authApi.login(payload);
      const next = { token: data.token, user: data.user };
      localStorage.setItem("store-rating-auth", JSON.stringify(next));
      setAuth(next);
      return next;
    },
    async register(payload) {
      const { data } = await authApi.register(payload);
      const next = { token: data.token, user: data.user };
      localStorage.setItem("store-rating-auth", JSON.stringify(next));
      setAuth(next);
      return next;
    },
    logout
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
