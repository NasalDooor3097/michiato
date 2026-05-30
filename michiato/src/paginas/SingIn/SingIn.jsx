// src/componentes/SignUp/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SingIn.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.9 17.9A10.5 10.5 0 0 1 12 19.5C7 19.5 2.7 16.1 1 11.5c.8-2.1 2.1-4 3.8-5.5M9.9 4.2A10 10 0 0 1 12 4c5 0 9.3 3.4 11 8-.4 1.1-1 2.2-1.7 3.1M1 1l22 22"/>
      <path d="M10.4 10.4a3 3 0 0 0 4.2 4.2"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

const InputField = ({ id, label, type, placeholder, value, onChange, icon, toggleable, showValue, onToggle, error }) => (
  <div className="su-form-group">
    <label htmlFor={id}>{label}</label>
    <div className={`su-input-wrapper ${error ? 'su-input-error' : ''}`}>
      <span className="su-input-icon">{icon}</span>
      <input
        id={id}
        type={toggleable ? (showValue ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete={id}
      />
      {toggleable && (
        <button type="button" className="su-toggle-eye" onClick={onToggle} aria-label="Alternar visibilidad">
          <EyeIcon open={showValue} />
        </button>
      )}
    </div>
    {error && <p className="su-field-error">{error}</p>}
  </div>
);

const SingIn = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [errores, setErrores]             = useState({});
  const [errorGlobal, setErrorGlobal]     = useState('');
  const [cargando, setCargando]           = useState(false);
  const [exito, setExito]                 = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const validar = () => {
    const e = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 2)
      e.nombre = 'El nombre debe tener al menos 2 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Ingresa un correo válido.';
    if (form.password.length < 8)
      e.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (form.password !== form.confirmar)
      e.confirmar = 'Las contraseñas no coinciden.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGlobal('');
    const e2 = validar();
    if (Object.keys(e2).length > 0) { setErrores(e2); return; }
    setErrores({});
    setCargando(true);

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email:  form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.mensaje || 'No se pudo crear la cuenta.');
      setExito(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <main className="su-page">
        <div className="su-card su-card--exito">
          <div className="su-exito-icono">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="su-title">¡Cuenta creada!</h1>
          <p className="su-subtitle">Redirigiendo al inicio de sesión…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="su-page">
      <div className="su-card">

        <div className="su-header">
          <div className="su-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <h1 className="su-title">Crear cuenta</h1>
          <p className="su-subtitle">Únete a Cafetería Michiato</p>
        </div>

        <form className="su-form" onSubmit={handleSubmit} noValidate>

          <InputField
            id="nombre"
            label="Nombre completo"
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={set('nombre')}
            error={errores.nombre}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }
          />

          <InputField
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={set('email')}
            error={errores.email}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
            }
          />

          <InputField
            id="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={set('password')}
            error={errores.password}
            toggleable
            showValue={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
          />

          {/* Barra de fortaleza de contraseña */}
          {form.password.length > 0 && (
            <PasswordStrength password={form.password} />
          )}

          <InputField
            id="confirmar"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={form.confirmar}
            onChange={set('confirmar')}
            error={errores.confirmar}
            toggleable
            showValue={showConfirmar}
            onToggle={() => setShowConfirmar(!showConfirmar)}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            }
          />

          {errorGlobal && (
            <p className="su-error-global" role="alert">{errorGlobal}</p>
          )}

          <button type="submit" className={`su-btn ${cargando ? 'su-btn--loading' : ''}`} disabled={cargando}>
            {cargando ? <span className="su-spinner" aria-hidden="true" /> : 'Crear cuenta'}
          </button>
        </form>

        <p className="su-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="su-link">Inicia sesión</Link>
        </p>

      </div>
    </main>
  );
};

// ── Barra de fortaleza ────────────────────────────────────
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
const strengthColor = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];

const PasswordStrength = ({ password }) => {
  const score = getStrength(password);
  return (
    <div className="su-strength">
      <div className="su-strength-bars">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="su-strength-bar"
            style={{ background: i <= score ? strengthColor[score] : '#e2e0d8' }}
          />
        ))}
      </div>
      <span className="su-strength-label" style={{ color: strengthColor[score] }}>
        {strengthLabel[score]}
      </span>
    </div>
  );
};

export default SingIn;