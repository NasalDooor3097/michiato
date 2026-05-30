import React, { useState } from "react";
import "./LogIn.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext"; // 🔥 Importamos tu contexto

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 🔥 Estado para mostrar errores

  const { iniciarSesion, cargando } = useAuth(); // 🔥 Sacamos la función y el estado de carga
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Llamamos a la función real que hace el fetch a tu authRoutes.js
      await iniciarSesion(email, password);
      // Si todo sale bien, lo mandamos al inicio
      navigate("/");
    } catch (err) {
      // Si el backend dice "Credenciales incorrectas", lo pintamos
      setErrorMsg(err.message);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12z"/>
              <path d="M3.6 21.6c0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4"/>
            </svg>
          </div>
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Ingresa a tu cuenta para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
              <input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.9 17.9A10.5 10.5 0 0 1 12 19.5C7 19.5 2.7 16.1 1 11.5c.8-2.1 2.1-4 3.8-5.5M9.9 4.2A10 10 0 0 1 12 4c5 0 9.3 3.4 11 8-.4 1.1-1 2.2-1.7 3.1M1 1l22 22"/>
                    <path d="M10.4 10.4a3 3 0 0 0 4.2 4.2"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 🔥 Agregamos el mensaje de error para que el cliente sepa si se equivocó */}
          {errorMsg && (
            <p className="login-error-msg" style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '-10px' }}>
              {errorMsg}
            </p>
          )}

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className={`submit-btn ${cargando ? "loading" : ""}`} disabled={cargando}>
            {cargando ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className="signup-prompt">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="signup-link">Regístrate aquí</Link>
        </p>
      </div>
    </main>
  );
};

export default LogIn;