import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    credential: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Si ya está autenticado, redirigir según rol
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === "OWNER" ? "/owner" : "/app";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData.credential, formData.password);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const redirectPath = userData.role === "OWNER" ? "/owner" : "/app";
        console.log("[LoginPage] Login exitoso, redirigiendo a:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      console.error("[LoginPage] Error en login:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__top-glow" />
        <div className="login-card__content">
          {/* Icono */}
          <div className="login-card__icon">
            <span className="login-card__icon-symbol">✂</span>
          </div>

          {/* Títulos */}
          <h1 className="login-title">THE BARBER CLUB</h1>
          <p className="login-subtitle">
            Tu estilo, nuestra pasión. Bienvenido.
          </p>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Correo / usuario */}
            <div className="login-field">
              <label className="login-label">Correo o Usuario</label>
              <div className="login-input-wrapper">
                <input
                  type="text"
                  name="credential"
                  placeholder="ejemplo@correo.com"
                  value={formData.credential}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
                <span className="login-input-icon">
                  👤
                </span>
              </div>
            </div>

            {/* Contraseña */}
            <div className="login-field">
              <label className="login-label">Contraseña</label>
              <div className="login-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  className="login-input-icon login-input-icon-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Olvidaste contraseña */}
            <div className="login-forgot">
              <Link to="/reset-password" className="login-forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? "Iniciando..." : "INICIAR SESIÓN"}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <span>¿Nuevo aquí? </span>
            <Link to="/register" className="login-register-link">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
