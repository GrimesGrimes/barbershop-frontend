import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authApi from "../../api/auth";

/**
 * VerifyEmailPage - Página de verificación de email
 *
 * Misma lógica, UI unificada con el estilo THE BARBER CLUB.
 */
const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, user } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);

  // Mensaje desde el estado de navegación (por ejemplo, desde el registro)
  const message =
    (location.state as { message?: string } | null)?.message ?? undefined;

  // Check if we came from registration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromRegister = (location.state as any)?.from === 'register';
  const hasRequestedRef = React.useRef(false);

  // Solicitar código al cargar (solo una vez), si el usuario tiene email y no está verificado
  // Y si NO viene del registro (porque el registro ya envía uno)
  useEffect(() => {
    const requestCode = async () => {
      // Si venimos de registrarse, ya se envió un email. No enviar otro.
      if (fromRegister) return;

      // Prevención de doble ejecución (React StrictMode)
      if (hasRequestedRef.current) return;

      if (user?.email && !user?.emailVerified) {
        hasRequestedRef.current = true;
        setIsRequestingCode(true);
        try {
          await authApi.requestEmailVerification();
        } catch (err) {
          console.log("[VerifyEmailPage] Error solicitando código:", err);
        }
        setIsRequestingCode(false);
      }
    };
    requestCode();
  }, [user?.email, user?.emailVerified, fromRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await verifyEmail(code);
      setSuccess("¡Email verificado correctamente!");
      setTimeout(() => {
        navigate(user?.role === "OWNER" ? "/owner" : "/app");
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error en la verificación";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setIsRequestingCode(true);
    try {
      await authApi.requestEmailVerification();
      setSuccess("Código reenviado correctamente.");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al reenviar código";
      setError(errorMessage);
    } finally {
      setIsRequestingCode(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__top-glow" />
        <div className="login-card__content">
          {/* Icono */}
          <div className="login-card__icon">
            <span className="login-card__icon-symbol">✉</span>
          </div>

          {/* Títulos */}
          <h1 className="login-title">VERIFICA TU CORREO</h1>
          <p className="login-subtitle">
            Hemos enviado un código de verificación a:
          </p>
          <p className="login-verify-email">{user?.email}</p>

          {/* Mensaje de origen (por ejemplo, desde registro) */}
          {message && (
            <div className="login-message-success">{message}</div>
          )}

          {/* Error / Success dinámicos */}
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-message-success">{success}</div>}

          {/* Formulario */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Código de verificación</label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="login-input verify-code-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? "Verificando..." : "VERIFICAR"}
            </button>
          </form>

          {/* Reenviar código */}
          <div className="login-footer">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isRequestingCode}
              className="login-register-link"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: isRequestingCode ? "not-allowed" : "pointer",
                opacity: isRequestingCode ? 0.6 : 1,
              }}
            >
              {isRequestingCode
                ? "Enviando código..."
                : "¿No recibiste el código? Reenviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
