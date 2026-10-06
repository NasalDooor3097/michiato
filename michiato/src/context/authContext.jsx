import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('michiato_usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('michiato_usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('michiato_usuario');
    }
  }, [usuario]);

  const estaAutenticado = usuario !== null;


  const tieneRol = (rolesPermitidos) => {
    if (!usuario || !usuario.rol) return false;
    if (Array.isArray(rolesPermitidos)) {
      return rolesPermitidos.includes(usuario.rol);
    }
    return usuario.rol === rolesPermitidos;
  };

  const esAdmin = usuario?.rol === 'admin';
  const esHost = usuario?.rol === 'host';
  const esCliente = usuario?.rol === 'cliente';

  const iniciarSesion = async (email, password) => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
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

  const setUsuarioContext = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado,
        cargando,
        tieneRol,
        esAdmin,
        esHost,
        esCliente,
        iniciarSesion,
        cerrarSesion,
        setUsuarioContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};