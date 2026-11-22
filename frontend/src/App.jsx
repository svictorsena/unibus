import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoutesQueryPage } from './pages/RoutesQueryPage';
import { ManageRoutesPage } from './pages/ManageRoutesPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { NoticesPage } from './pages/NoticesPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProfileSettings } from './pages/ProfileSettings';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-slate-600">Carregando sessão...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.perfil)) return <Navigate to="/dashboard" replace />;
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="rotas" element={<RoutesQueryPage />} />
            <Route
              path="gerenciar-rotas"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <ManageRoutesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="cadastros"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <RegistrationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="avisos" element={<NoticesPage />} />
            <Route path="ocorrencias" element={<IncidentsPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
