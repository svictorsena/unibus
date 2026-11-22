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
import { Skeleton } from './components/Skeleton';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-[260px] shrink-0 space-y-4 border-r border-[#29252F] bg-[#08070B] p-5 md:block">
          <Skeleton className="h-9 w-48" />
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-3 p-4 md:space-y-4 md:p-8">
          <Skeleton className="h-6 w-40 md:h-8 md:w-64" />
          <Skeleton className="h-3 w-56 md:h-4 md:w-96" />
          <Skeleton className="h-10 w-full md:hidden" />
          <Skeleton className="mt-4 h-24 w-full md:mt-8 md:h-56" />
          <Skeleton className="h-[60%] w-full md:h-40" />
        </div>
      </div>
    );
  }
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
