import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import authApi, { type RegisterRequest } from "../../api/auth";

/**
 * RegisterPage - Página de registro
 *
 * UI adaptada al mismo estilo que el login (THE BARBER CLUB),
 * manteniendo exactamente la misma lógica de registro y redirección.
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Mantengo tu lógica original
      if (data.token && data.user) {
        setAuth(data.user, data.token);
      }

      navigate("/verify-email", {
        state: {
          message: "¡Registro exitoso! Ahora verifica tu correo electrónico.",
          from: "register",
        },
        replace: true,
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar";
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    // Enviar sólo phone si tiene valor
    const dataToSend: RegisterRequest = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    if (formData.phone?.trim()) {
      dataToSend.phone = formData.phone;
    }

    registerMutation.mutate(dataToSend);
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
          <h1 className="login-title">CREAR CUENTA</h1>
          <p className="login-subtitle">
            Únete a THE BARBER CLUB y gestiona tus reservas fácilmente.
          </p>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Nombre completo */}
            <div className="login-field">
              <label className="login-label">Nombre completo</label>
              <input
                type="text"
                name="fullName"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="login-input"
              />
            </div>

            {/* Usuario */}
            <div className="login-field">
              <label className="login-label">Usuario</label>
              <input
                type="text"
                name="username"
                placeholder="juanperez"
                value={formData.username}
                onChange={handleChange}
                required
                className="login-input"
              />
              <p className="register-helper-text">
                Será tu nombre de usuario para iniciar sesión.
              </p>
            </div>

            {/* Email */}
            <div className="login-field">
              <label className="login-label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="login-input"
              />
              <p className="register-helper-text">
                Lo usaremos para verificación y notificaciones.
              </p>
            </div>

            {/* Teléfono (opcional) */}
            <div className="login-field">
              <label className="login-label">Teléfono (opcional)</label>
              <input
                type="tel"
                name="phone"
                placeholder="+51987654321"
                value={formData.phone || ""}
                onChange={handleChange}
                className="login-input"
              />
              <p className="register-helper-text">
                Opcional – para notificaciones por WhatsApp.
              </p>
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
                  minLength={6}
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  className="login-input-icon login-input-icon-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              <p className="register-helper-text">Mínimo 6 caracteres.</p>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="login-button"
            >
              {registerMutation.isPending ? "Registrando..." : "CREAR CUENTA"}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <span>¿Ya tienes cuenta?</span>
            <Link to="/login" className="login-register-link">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
