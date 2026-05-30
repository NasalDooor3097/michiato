// src/context/CartContext.jsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems]         = useState([]);   // productos en el carrito
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // ── Agregar producto (o sumar cantidad si ya existe) ──
  const agregarAlCarrito = (producto) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  // ── Restar cantidad (elimina si llega a 0) ──
  const restarDelCarrito = (id) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0)
    );
  };

  // ── Eliminar producto completo ──
  const eliminarDelCarrito = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Vaciar todo ──
  const vaciarCarrito = () => setItems([]);

  // ── Totales ──
  const totalItems  = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrecio = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        carritoAbierto,
        setCarritoAbierto,
        agregarAlCarrito,
        restarDelCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook conveniente
export const useCart = () => useContext(CartContext);