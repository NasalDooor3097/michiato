// src/componentes/NavBar/NavBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Menu, CreditCard, User, ShoppingBag, X, Plus, Minus, Receipt, DollarSign, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/cartContext';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import './NavBar.css';

const NavBar = () => {
  const [menuAbierto, setMenuAbierto]     = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [datosCuenta, setDatosCuenta]     = useState({ productos: [], total: 0, ordenActiva: false, idPedido: null });

  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [tipoTarjeta, setTipoTarjeta]               = useState(null);
  const [datosFormPago, setDatosFormPago]           = useState({ tarjeta: '', exp: '', cvc: '' });

  const [idMesaGuardada,    setIdMesaGuardada]    = useState(localStorage.getItem('michiato_mesa')   || null);
  const [codigoMesaGuardado, setCodigoMesaGuardado] = useState(localStorage.getItem('michiato_codigo') || null);

  const { items, carritoAbierto, setCarritoAbierto, agregarAlCarrito, restarDelCarrito, vaciarCarrito, totalItems, totalPrecio } = useCart();
  
  // 🔥 Nos traemos setUsuarioContext para actualizar el perfil en caliente
  const { usuario, estaAutenticado, setUsuarioContext } = useAuth();
  const navigate = useNavigate();

  const tieneDescuento = estaAutenticado && (usuario?.tiene_descuento === true || usuario?.tiene_descuento === 1);
  const montoDescuento = tieneDescuento ? (totalPrecio * 0.10) : 0;
  const totalConDescuento = totalPrecio - montoDescuento;

  useEffect(() => {
    const mesaGuardada = localStorage.getItem('michiato_mesa');
    if (mesaGuardada) obtenerCuentaMesa(mesaGuardada);
  }, []);

  const toggleMenu    = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu    = () => setMenuAbierto(false);
  const abrirCarrito  = () => setCarritoAbierto(true);
  const cerrarCarrito = () => setCarritoAbierto(false);

  const obtenerCuentaMesa = async (idOverride) => {
    const id = idOverride || idMesaGuardada;
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/consultarCuenta/${id}`);
      if (res.data.success) {
        setDatosCuenta(res.data);
        if (!res.data.ordenActiva) resetearEstadoLocal();
      }
    } catch (err) {
      console.error('Error al traer la cuenta:', err);
    }
  };

  const resetearEstadoLocal = () => {
    localStorage.removeItem('michiato_mesa');
    localStorage.removeItem('michiato_codigo');
    setIdMesaGuardada(null);
    setCodigoMesaGuardado(null);
    setMetodoSeleccionado(null);
    setTipoTarjeta(null);
  };

  const handleAbrirCuenta = () => {
    obtenerCuentaMesa();
    setCuentaAbierta(true);
  };

  const handleRegresarPaso = () => {
    if (tipoTarjeta !== null) setTipoTarjeta(null);
    else if (metodoSeleccionado !== null) setMetodoSeleccionado(null);
  };

  const handleClickTarjeta = () => {
    if (idMesaGuardada) {
      handleAbrirCuenta();
    } else {
      alert('Tu cuenta estará disponible en cuanto envíes tu primer pedido.');
    }
  };

  const handleClickUser = () => {
    if (estaAutenticado) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  const handleOrdenar = async () => {
    let codigoAFuego = codigoMesaGuardado;
    if (!codigoAFuego) {
      const codigoIngresado = prompt('Por favor, introduce el código de validación de tu mesa proporcionado por la hostess:');
      if (!codigoIngresado) {
        alert('Pedido cancelado. Es necesario introducir el código de tu mesa para poder ordenar.');
        return;
      }
      codigoAFuego = codigoIngresado;
    }
    try {
      // Mandamos la orden y avisamos si se consumió el descuento
      const respuesta = await axios.post('http://localhost:5000/api/validarCodigoMesa', {
        codigoCliente: codigoAFuego,
        carritoItems: items,
        totalPrecio: totalConDescuento,
        idUsuario: usuario ? usuario.id_usuario : null,
        descuentoAplicado: tieneDescuento // 👈 Le pasamos la bandera a MySQL
      });
      
      if (respuesta.data.success) {
        localStorage.setItem('michiato_mesa', respuesta.data.idMesa);
        localStorage.setItem('michiato_codigo', codigoAFuego);
        setIdMesaGuardada(respuesta.data.idMesa);
        setCodigoMesaGuardado(codigoAFuego);
        alert(`¡Pedido confirmado para la Mesa #${respuesta.data.idMesa}! Total: $${totalConDescuento.toFixed(2)} MXN.`);
        
        // 🔥 MAGIA: Si usó descuento, actualizamos el contexto para que desaparezca visualmente de toda la página
        if (tieneDescuento && usuario) {
            setUsuarioContext({ ...usuario, tiene_descuento: 0 });
        }

        vaciarCarrito();
        cerrarCarrito();
        obtenerCuentaMesa(respuesta.data.idMesa);
      }
    } catch (error) {
      if (error.response?.data) {
        alert(`❌ Error: ${error.response.data.mensaje}`);
        resetearEstadoLocal();
      } else {
        alert('❌ No se pudo conectar con el servidor.');
      }
    }
  };

  const procesarFinalizacionPago = async () => {
    if (tipoTarjeta === 'linea' && (!datosFormPago.tarjeta || !datosFormPago.cvc)) {
      alert('Por favor, llena los datos de tu tarjeta.');
      return;
    }

    const metodoFinal = tipoTarjeta === 'linea' ? 'linea'
      : tipoTarjeta === 'terminal' ? 'tarjeta'
      : metodoSeleccionado;

    try {
      await axios.post('http://localhost:5000/api/solicitarCobro', {
        idMesa: idMesaGuardada,
        metodoPago: metodoFinal,
        total: datosCuenta.total,
      });

      if (tipoTarjeta === 'linea') {
        alert('💳 ¡Pago en línea procesado! Gracias por tu visita. Un momento mientras caja confirma.');
      } else {
        alert(metodoSeleccionado === 'efectivo'
          ? '🧾 Solicitud enviada. Un mesero te llevará el ticket.'
          : '💳 Solicitud enviada. El mesero llevará la terminal a tu mesa.');
      }

      setMetodoSeleccionado(null);
      setTipoTarjeta(null);
      setCuentaAbierta(false);
    } catch (err) {
      console.error('Error al solicitar cobro:', err);
      alert('Error al registrar la solicitud de pago.');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <button className="icon-button menu-icon" onClick={toggleMenu}><Menu size={24} /></button>
          </div>

          <div className="navbar-center">
            <Link to="/" className="navbar-logo-link"><h1 className="navbar-logo">Cafeteria Michiato</h1></Link>
          </div>

          <div className="navbar-right">
            <button className={idMesaGuardada ? "icon-button btn-cuenta-activa" : "icon-button"} onClick={handleClickTarjeta}>
              <CreditCard size={22} />
              {idMesaGuardada && <span className="cuenta-indicador">M#{idMesaGuardada}</span>}
            </button>

            <button 
              className="icon-button" 
              onClick={handleClickUser} 
              style={estaAutenticado && usuario?.avatar ? { padding: 0, overflow: 'hidden', borderRadius: '50%' } : {}}
            >
              {estaAutenticado && usuario?.avatar ? (
                  <img src={usuario.avatar} alt="Avatar" style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
              ) : (
                  <User size={20} />
              )}
            </button>

            <button className="icon-button cart-icon" onClick={abrirCarrito}>
              <ShoppingBag size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Menú Lateral */}
      <div className={`menu-lateral ${menuAbierto ? 'menu-abierto' : ''}`}>
        <div className="menu-overlay" onClick={cerrarMenu}></div>
        <div className="menu-contenido">
          <nav className="menu-navegacion">
            <Link to="/" className="menu-link" onClick={cerrarMenu}>Inicio</Link>
            <Link to="/menu" className="menu-link" onClick={cerrarMenu}>Menú</Link>
            <Link to="/menu-pets" className="menu-link" onClick={cerrarMenu}>Menú Mascotas</Link>
            <Link to="/about-us" className="menu-link" onClick={cerrarMenu}>Nosotros</Link>
          </nav>
        </div>
      </div>

      {/* Carrito Bottom Sheet */}
      {carritoAbierto && <div className="carrito-overlay" onClick={cerrarCarrito} />}
      <div className={`carrito-sheet ${carritoAbierto ? 'carrito-sheet--abierto' : ''}`}>
        <div className="carrito-handle" />
        <div className="carrito-header">
          <h2>Mi pedido</h2>
          <button className="carrito-cerrar" onClick={cerrarCarrito}><X size={20} /></button>
        </div>
        
        <div className="carrito-lista">
          {items.length === 0 ? (
            <div className="carrito-vacio"><ShoppingBag size={40} /><p>Tu carrito está vacío</p></div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="carrito-item">
                <div className="carrito-item-info"><p>{item.nombre}</p><p>${item.precio}.00 x {item.cantidad}</p></div>
                <div className="carrito-item-controles">
                  <button className="qty-btn" onClick={() => restarDelCarrito(item.id)}><Minus size={14} /></button>
                  <span className="qty-num">{item.cantidad}</span>
                  <button className="qty-btn" onClick={() => agregarAlCarrito(item)}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="carrito-footer">
            {tieneDescuento ? (
              <div className="desglose-pago-box">
                <div className="fila-desglose">
                  <span>Subtotal</span>
                  <span className="texto-tachado">${totalPrecio}.00 MXN</span>
                </div>
                <div className="fila-desglose descuento-aplicado">
                  <span>🎁 Cupón 10% OFF</span>
                  <span>-${montoDescuento.toFixed(2)} MXN</span>
                </div>
                <div className="fila-desglose total-final">
                  <span>Total a Pagar</span>
                  <span>${totalConDescuento.toFixed(2)} MXN</span>
                </div>
              </div>
            ) : (
              <div className="carrito-total">
                <span>Total</span><span>${totalPrecio}.00 MXN</span>
              </div>
            )}

            <button className="btn-ordenar" onClick={handleOrdenar}>Ordenar ahora</button>
          </div>
        )}
      </div>

      {/* Modal Cuenta */}
      {cuentaAbierta && (
        <div className="cuenta-modal-overlay" onClick={() => setCuentaAbierta(false)}>
          <div className="cuenta-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cuenta-header">
              <Receipt size={24} />
              <h2>Tu Cuenta (Mesa #{idMesaGuardada})</h2>
              <button onClick={() => setCuentaAbierta(false)}><X size={20} /></button>
            </div>
            <div className="cuenta-cuerpo">
              {datosCuenta.productos.length > 0 && (
                <div className="cuenta-lista-items">
                  {datosCuenta.productos.map((prod, index) => (
                    <div key={index} className="cuenta-row-item">
                      <span>{parseInt(prod.cantidad)}x {prod.nombre_producto}</span>
                      <span>${prod.precio_unitario * prod.cantidad}.00</span>
                    </div>
                  ))}
                  <div className="cuenta-total-final"><span>Total Consumido:</span><span>${datosCuenta.total}.00 MXN</span></div>
                  <hr className="divisor-ticket" />

                  {metodoSeleccionado === null && (
                    <div className="seleccion-pago">
                      <h3>¿Cómo deseas realizar tu pago?</h3>
                      <div className="grupo-botones-pago">
                        <button className="btn-opcion-pago" onClick={() => setMetodoSeleccionado('efectivo')}><DollarSign size={18} /> Efectivo</button>
                        <button className="btn-opcion-pago" onClick={() => setMetodoSeleccionado('tarjeta')}><CreditCard size={18} /> Tarjeta</button>
                      </div>
                    </div>
                  )}

                  {metodoSeleccionado === 'tarjeta' && tipoTarjeta === null && (
                    <div className="seleccion-pago">
                      <h3>Elige el método de cargo:</h3>
                      <div className="grupo-botones-pago">
                        <button className="btn-opcion-pago" onClick={() => setTipoTarjeta('terminal')}><Smartphone size={18} /> Terminal Física</button>
                        <button className="btn-opcion-pago" onClick={() => setTipoTarjeta('linea')}><CreditCard size={18} /> Pagar en Línea</button>
                      </div>
                      <button className="btn-regresar" onClick={handleRegresarPaso}>⬅️ Volver</button>
                    </div>
                  )}

                  {((metodoSeleccionado === 'efectivo') || (metodoSeleccionado === 'tarjeta' && tipoTarjeta !== null)) && (
                    <div className="finalizacion-pago">
                      {tipoTarjeta === 'linea' && (
                        <div className="formulario-tarjeta">
                          <input type="text" placeholder="Número de tarjeta" onChange={(e) => setDatosFormPago({...datosFormPago, tarjeta: e.target.value})} />
                          <div className="form-row-mini">
                            <input type="text" placeholder="MM/AA" onChange={(e) => setDatosFormPago({...datosFormPago, exp: e.target.value})} />
                            <input type="password" placeholder="CVC" onChange={(e) => setDatosFormPago({...datosFormPago, cvc: e.target.value})} />
                          </div>
                        </div>
                      )}
                      <p className="texto-confirmacion">
                        {metodoSeleccionado === 'efectivo' && "Confirmas que pagarás en efectivo. El mesero llevará el ticket."}
                        {tipoTarjeta === 'terminal' && "Confirmas que requieres la terminal bancaria inalámbrica en tu mesa."}
                        {tipoTarjeta === 'linea' && "Listo para realizar el cargo bancario seguro a tu tarjeta."}
                      </p>
                      <div className="grupo-botones-pago">
                        <button className="btn-confirmar-pago" onClick={procesarFinalizacionPago}>Confirmar y Finalizar</button>
                        <button className="btn-regresar" onClick={handleRegresarPaso}>⬅️ Cambiar método</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;