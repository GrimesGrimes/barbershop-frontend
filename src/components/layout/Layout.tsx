import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();

  // OWNER y CLIENT usan sus layouts propios (OwnerLayout / ClientLayout).
  // Este Layout NO debe renderizar topbar para evitar duplicados.
  if (user?.role === 'OWNER' || user?.role === 'CLIENT') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <Outlet />
      </div>
    );
  }

  // Si tuvieras páginas públicas (no autenticadas), este Layout puede quedar como wrapper neutro.
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Outlet />
    </div>
  );
};

export default Layout;
