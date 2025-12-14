import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/auth";

/**
 * ResetPasswordRequestPage - Solicitar código de recuperación
 *
 * Misma lógica, UI unificada con el estilo THE BARBER CLUB.
 */
const ResetPasswordRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const requestResetMutation = useMutation({
    mutationFn: (phone: string) => authApi.requestPasswordReset(phone),
    onSuccess: () => {
      navigate("/reset-password/confirm", { state: { phone } });
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Error al solicitar reset";
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
    requestResetMutation.mutate(phone);
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
          <h1 className="login-title">RECUPERAR CONTRASEÑA</h1>
          <p className="login-subtitle">
            Ingresa tu teléfono para recibir un código de recuperación.
          </p>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
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
                Usaremos este número para enviarte el código de recuperación.
              </p>
            </div>

            <button
              type="submit"
              disabled={requestResetMutation.isPending}
              className="login-button"
            >
              {requestResetMutation.isPending
                ? "Solicitando..."
                : "ENVIAR CÓDIGO"}
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

export default ResetPasswordRequestPage;
