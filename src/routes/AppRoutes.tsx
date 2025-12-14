// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyPhonePage from '../pages/auth/VerifyPhonePage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ResetPasswordRequestPage from '../pages/auth/ResetPasswordRequestPage';
import ResetPasswordConfirmPage from '../pages/auth/ResetPasswordConfirmPage';

// Client pages
import NewBookingPage from '../pages/client/NewBookingPage';
import MyBookingsPage from '../pages/client/MyBookingsPage';
import ProfilePage from '../pages/client/ProfilePage';

// Owner pages
import OwnerHomePage from '../pages/owner/OwnerHomePage';
import OwnerBookingsPage from '../pages/owner/OwnerBookingsPage';
import OwnerDisabledSlotsPage from '../pages/owner/OwnerDisabledSlotsPage';
import OwnerSchedulePage from '../pages/owner/OwnerSchedulePage';
import OwnerProfilePage from '../pages/owner/OwnerProfilePage';

// Components
import { ProtectedRoute } from './ProtectedRoute';
import Layout from '../components/layout/Layout';

/**
 * HomeRedirect - Redirige según el estado de autenticación y rol
 */
const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    // Si está logueado, lo mandamos a su panel según rol
    return <Navigate to={user.role === 'OWNER' ? '/owner' : '/app'} replace />;
  }

  // Si no está autenticado, al login
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordRequestPage />} />
        <Route path="/reset-password/confirm" element={<ResetPasswordConfirmPage />} />

        {/* Verificaciones (requieren sesión) */}
        <Route
          path="/verify-phone"
          element={
            <ProtectedRoute>
              <VerifyPhonePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <ProtectedRoute>
              <VerifyEmailPage />
            </ProtectedRoute>
          }
        />

        {/* Área CLIENTE */}
        <Route
          path="/app"
          element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              {/* Layout general (Navbar cliente) */}
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* /app -> redirige a nueva reserva */}
          <Route index element={<Navigate to="new-booking" replace />} />
          <Route path="new-booking" element={<NewBookingPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Área DUEÑO */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              {/* OJO: Layout ya detecta role === 'OWNER' y solo envuelve con fondo + <Outlet /> */}
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerHomePage />} />
          <Route path="bookings" element={<OwnerBookingsPage />} />
          <Route path="disabled-slots" element={<OwnerDisabledSlotsPage />} />
          <Route path="schedule" element={<OwnerSchedulePage />} />
          <Route path="profile" element={<OwnerProfilePage />} />
        </Route>

        {/* Redirecciones por defecto */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
