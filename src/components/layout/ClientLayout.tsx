// ClientLayout.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ClientLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({
  title = "Panel del cliente",
  subtitle = "Reserva tu cita y revisa tus reservas",
  children,
}) => {
  const { user, logout } = useAuth();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CL";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay ${isSidebarOpen ? "admin-overlay--visible" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`admin-sidebar ${isSidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__logo">✂</div>
            <div className="admin-sidebar__title">THE BARBER CLUB</div>
          </div>

          <button
            type="button"
            className="admin-sidebar__close"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink
            to="/app/new-booking"
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">➕</span>
              <span className="admin-sidebar__link-text">Reservar</span>
            </span>
          </NavLink>

          <NavLink
            to="/app/my-bookings"
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">📅</span>
              <span className="admin-sidebar__link-text">Mis reservas</span>
            </span>
          </NavLink>

          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">👤</span>
              <span className="admin-sidebar__link-text">Perfil</span>
            </span>
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__footer-user">
            <div className="admin-sidebar__footer-avatar">{initials}</div>
            <div className="admin-sidebar__footer-info">
              <div className="admin-sidebar__footer-name">{user?.fullName || "Cliente"}</div>
              <div className="admin-sidebar__footer-role">Sesión como cliente</div>
            </div>
          </div>

          <button type="button" className="admin-sidebar__logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-header__hamburger"
            onClick={openSidebar}
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="admin-header__left">
            <div className="admin-header__title">{title}</div>
            <div className="admin-header__subtitle">{subtitle}</div>
          </div>

          <div className="admin-header__right">
            <div className="admin-header__user">
              <div className="admin-header__avatar">{initials}</div>
              <div className="admin-header__user-info">
                <div className="admin-header__user-name">{user?.fullName || "Cliente"}</div>
                <div className="admin-header__user-email">{user?.email || ""}</div>
              </div>
            </div>

            <button className="admin-header__button" type="button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default ClientLayout;
