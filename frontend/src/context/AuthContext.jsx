import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tu_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('tu_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('tu_token');
        localStorage.removeItem('tu_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('tu_token', data.token);
    localStorage.setItem('tu_user', JSON.stringify(data.usuario));
    setUser(data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('tu_token');
    localStorage.removeItem('tu_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
