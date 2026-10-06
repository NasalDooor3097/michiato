// src/componentes/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { estaAutenticado, tieneRol, cargando } = useAuth();

  
  if (cargando) {
    return <div>Cargando...</div>;
  }

 
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  
  if (allowedRoles && !tieneRol(allowedRoles)) {
    return <Navigate to="/" replace />;
  }


  return children;
};