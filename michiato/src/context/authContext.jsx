// src/context/authContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Intentamos restaurar la sesión desde localStorage al montar
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('michiato_usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const [cargando, setCargando] = useState(false);

  // Cada vez que cambia el usuario, sincronizamos localStorage
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('michiato_usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('michiato_usuario');
    }
  }, [usuario]);

  // Derivado: ¿hay sesión activa?
  const estaAutenticado = usuario !== null;

  /**
   * Inicia sesión llamando al backend.
   * Guarda en estado el objeto usuario que devuelva el servidor.
   * Lanza un error con mensaje legible si falla.
   */
  const iniciarSesion = async (email, password) => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.mensaje || 'Credenciales incorrectas');
      }

      setUsuario(data.usuario);
      return data.usuario;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('michiato_mesa');
    localStorage.removeItem('michiato_codigo');
  };

  // 🔥 NUEVA FUNCIÓN DISPONIBLE EN EL CONTEXTO:
  // Permite actualizar los datos del usuario en vivo (como apagar el cupón o cambiar avatar)
  const setUsuarioContext = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
  };

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado, cargando, iniciarSesion, cerrarSesion, setUsuarioContext }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de acceso rápido
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};