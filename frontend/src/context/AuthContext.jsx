import { createContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../api/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('auth:user', null);
  const [loading, setLoading] = useLocalStorage('auth:loading', false);

  const login = async (email) => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      const found = data?.users?.find(u => u.email?.toLowerCase() === String(email).toLowerCase());
      if (!found) throw new Error('User not found');
      setUser(found);
      return found;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ userName, email }) => {
    setLoading(true);
    try {
      const created = await api.createUser({ userName, email });
      const createdUser = created?.user || created; // route returns {user: ...}
      setUser(createdUser);
      return createdUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  useEffect(() => {
    // no-op: persistence handled by useLocalStorage
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

