import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const hasToken = Boolean(localStorage.getItem('tu_token'));

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, senha }) => {
      const { data } = await api.post('/auth/login', { email, senha });
      return data;
    },
  });

  useEffect(() => {
    if (currentUserQuery.data) {
      setUser(currentUserQuery.data);
      localStorage.setItem('tu_user', JSON.stringify(currentUserQuery.data));
    }

    if (currentUserQuery.isError) {
      localStorage.removeItem('tu_token');
      localStorage.removeItem('tu_user');
      setUser(null);
    }
  }, [currentUserQuery.data, currentUserQuery.isError]);

  const login = async (email, senha) => {
    const data = await loginMutation.mutateAsync({ email, senha });
    localStorage.setItem('tu_token', data.token);
    localStorage.setItem('tu_user', JSON.stringify(data.usuario));
    setUser(data.usuario);
    queryClient.setQueryData(['auth', 'me'], data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('tu_token');
    localStorage.removeItem('tu_user');
    setUser(null);
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading: currentUserQuery.isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
