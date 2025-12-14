import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/auth";

/**
 * ResetPasswordConfirmPage - Confirmar nueva contraseña
 *
 * Misma lógica, solo mejora visual al estilo THE BARBER CLUB.
 */
const ResetPasswordConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneFromState = (location.state as { phone?: string })?.phone || "";

  const [phone, setPhone] = useState(phoneFromState);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const confirmResetMutation = useMutation({
    mutationFn: () => authApi.confirmPasswordReset(phone, code, newPassword),
    onSuccess: () => {
      navigate("/login", {
        state: {
          message: "Contraseña actualizada. Ya puedes iniciar sesión.",
        },
      });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Error al confirmar reset";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    confirmResetMutation.mutate();
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
          <h1 className="login-title">NUEVA CONTRASEÑA</h1>
          <p className="login-subtitle">
            Ingresa el código que recibiste y define tu nueva contraseña.
          </p>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Teléfono */}
            <div className="login-field">
              <label className="login-label">Teléfono</label>
              <input
                type="tel"
                name="phone"
                placeholder="+51987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="login-input"
              />
              <p className="register-helper-text">
                Debe ser el mismo número donde recibiste el código.
              </p>
            </div>

            {/* Código */}
            <div className="login-field">
              <label className="login-label">Código de verificación</label>
              <input
                type="text"
                name="code"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="login-input"
              />
              <p className="register-helper-text">Código de 6 dígitos.</p>
            </div>

            {/* Nueva contraseña */}
            <div className="login-field">
              <label className="login-label">Nueva contraseña</label>
              <div className="login-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              disabled={confirmResetMutation.isPending}
              className="login-button"
            >
              {confirmResetMutation.isPending
                ? "Confirmando..."
                : "CONFIRMAR CONTRASEÑA"}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <Link to="/login" className="login-register-link">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirmPage;
