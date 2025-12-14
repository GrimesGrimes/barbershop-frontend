import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface OwnerLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({
  title = "Panel del barbero",
  subtitle = "Gestiona tu agenda y tus reservas",
  children,
}) => {
  const { user, logout } = useAuth();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BB";

  // 👇 Estado para abrir/cerrar el menú en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <div className="admin-shell">
      {/* Overlay para móvil */}
      <div
        className={`admin-overlay ${
          isSidebarOpen ? "admin-overlay--visible" : ""
        }`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          isSidebarOpen ? "admin-sidebar--open" : ""
        }`}
      >
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__logo">✂</div>
            <div className="admin-sidebar__title">THE BARBER CLUB</div>
          </div>

          {/* Botón cerrar solo visible en móvil (ya controlado por CSS) */}
          <button
            type="button"
            className="admin-sidebar__close"
            onClick={closeSidebar}
          >
            ✕
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink
            to="/owner"
            end
            className={({ isActive }) =>
              `admin-sidebar__link ${
                isActive ? "admin-sidebar__link--active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">🏠</span>
              <span className="admin-sidebar__link-text">Inicio</span>
            </span>
          </NavLink>

          <NavLink
            to="/owner/bookings"
            className={({ isActive }) =>
              `admin-sidebar__link ${
                isActive ? "admin-sidebar__link--active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">📅</span>
              <span className="admin-sidebar__link-text">Reservas</span>
            </span>
          </NavLink>

          <NavLink
            to="/owner/disabled-slots"
            className={({ isActive }) =>
              `admin-sidebar__link ${
                isActive ? "admin-sidebar__link--active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">🚫</span>
              <span className="admin-sidebar__link-text">Bloqueos</span>
            </span>
          </NavLink>

          <NavLink
            to="/owner/profile"
            className={({ isActive }) =>
              `admin-sidebar__link ${
                isActive ? "admin-sidebar__link--active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <span>
              <span className="admin-sidebar__link-icon">⚙</span>
              <span className="admin-sidebar__link-text">Perfil</span>
            </span>
          </NavLink>
        </nav>

        {/* Footer con info de usuario */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__footer-user">
            <div className="admin-sidebar__footer-avatar">{initials}</div>
            <div className="admin-sidebar__footer-info">
              <div className="admin-sidebar__footer-name">
                {user?.fullName || "Dueño"}
              </div>
              <div className="admin-sidebar__footer-role">
                Sesión como dueño
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-header">
          {/* Botón hamburguesa en móvil */}
          <button
            type="button"
            className="admin-header__hamburger"
            onClick={openSidebar}
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
                <div className="admin-header__user-name">
                  {user?.fullName || "Dueño"}
                </div>
                <div className="admin-header__user-email">
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <button
              className="admin-header__button"
              type="button"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default OwnerLayout;
