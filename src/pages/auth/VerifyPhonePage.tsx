import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import authApi from "../../api/auth";

/**
 * VerifyPhonePage - Verificación de teléfono (opcional)
 *
 * Misma lógica, UI unificada con el estilo THE BARBER CLUB.
 */
const VerifyPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { verifyPhone, user } = useAuth();

  const requestCodeMutation = useMutation({
    mutationFn: authApi.requestPhoneVerification,
    onSuccess: (data) => {
      setSuccess(data.message || "Código enviado a tu teléfono.");
      setError("");
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Error al solicitar código";
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
      setSuccess("");
    },
  });

  const confirmCodeMutation = useMutation({
    mutationFn: verifyPhone,
    onSuccess: () => {
      setSuccess("Teléfono verificado exitosamente.");
      setTimeout(() => {
        navigate(user?.role === "OWNER" ? "/owner" : "/app");
      }, 1500);
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Código inválido";
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

  const handleRequestCode = () => {
    if (!user?.phone) {
      setError(
        "No se encontró un número de teléfono asociado a tu cuenta."
      );
      return;
    }
    requestCodeMutation.mutate(user.phone);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    confirmCodeMutation.mutate(code);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__top-glow" />
        <div className="login-card__content">
          {/* Icono */}
          <div className="login-card__icon">
            <span className="login-card__icon-symbol">📱</span>
          </div>

          {/* Títulos */}
          <h1 className="login-title">VERIFICAR TELÉFONO</h1>
          <p className="login-subtitle">
            Verifica tu teléfono para recibir notificaciones por WhatsApp.
          </p>
          {user?.phone && (
            <p className="login-verify-email">{user.phone}</p>
          )}

          {/* Mensajes */}
          {error && <div className="login-error">{error}</div>}
          {success && (
            <div className="login-message-success">{success}</div>
          )}

          {/* Botón para solicitar código */}
          <div className="login-form" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              onClick={handleRequestCode}
              disabled={requestCodeMutation.isPending}
              className="login-secondary-button"
            >
              {requestCodeMutation.isPending
                ? "Enviando..."
                : "SOLICITAR CÓDIGO"}
            </button>
          </div>

          {/* Formulario de confirmación */}
          <form onSubmit={handleConfirm} className="login-form">
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
                className="login-input verify-code-input"
              />
              <p className="register-helper-text">
                Ingresa el código de 6 dígitos.
              </p>
            </div>

            <button
              type="submit"
              disabled={confirmCodeMutation.isPending}
              className="login-button"
            >
              {confirmCodeMutation.isPending
                ? "Verificando..."
                : "VERIFICAR"}
            </button>
          </form>

          {/* Omitir */}
          <div className="login-footer">
            <button
              type="button"
              onClick={() =>
                navigate(user?.role === "OWNER" ? "/owner" : "/app")
              }
              className="login-skip-link"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhonePage;
