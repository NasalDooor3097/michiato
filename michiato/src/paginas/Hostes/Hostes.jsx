import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Hostes.css";

const Hostes = () => {
    // Estado del mapa de mesas
    const [todasLasMesas, setTodasLasMesas] = useState([]);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    // Estados para la nueva sección de adeudos
    const [mesaConsulta, setMesaConsulta] = useState("");
    const [resultadoAdeudo, setResultadoAdeudo] = useState(null);
    const [cargandoAdeudo, setCargandoAdeudo] = useState(false);

    // Función para sincronizar el estado actual del JSON (sirve para carga inicial y recarga)
    const sincronizarMesas = async () => {
        try {
            // Mandamos el ID 0 como truco para que el backend solo lea el JSON sin modificar nada
            const respuesta = await axios.post("http://localhost:5000/cambiarEstadoMesa", { idMesa: 0 });
            if (respuesta.data.success) {
                setTodasLasMesas(respuesta.data.mesas);
                setError(null); // Limpiamos cualquier error previo
            }
        } catch (err) {
            console.error("Error al sincronizar el mapa de mesas:", err);
            setError("Error de conexión con el servidor. No se pudo sincronizar.");
        }
    };

    // Al cargar el componente por primera vez, levantamos el mapa y activamos el reloj
    useEffect(() => {
        sincronizarMesas();

        // Refresco automático del mapa cada 1 minuto (60000ms)
        const intervalo = setInterval(() => {
            console.log("Sincronizando mapa de mesas con el servidor...");
            sincronizarMesas();
        }, 60000);

        return () => clearInterval(intervalo);
    }, []);

    // Función que se ejecuta cuando la hostess le pica a cualquier mesa para ocuparla/liberarla
    const handleMesaClick = async (idMesa) => {
        setError(null);
        setCargando(true);
        
        try {
            const respuesta = await axios.post("http://localhost:5000/cambiarEstadoMesa", { idMesa });
            if (respuesta.data.success) {
                setTodasLasMesas(respuesta.data.mesas);
            }
        } catch (err) {
            console.error("Error al cambiar estado de la mesa:", err);
            setError("No se pudo actualizar el estado de la mesa seleccionada.");
        } finally {
            setCargando(false);
        }
    };

    // 🔥 NUEVA FUNCIÓN: Revisar si la mesa debe dinero en MySQL
    const revisarAdeudo = async (e) => {
        e.preventDefault();
        if (!mesaConsulta) return;
        
        setCargandoAdeudo(true);
        setResultadoAdeudo(null);
        
        try {
            // Reciclamos el endpoint que usamos en la NavBar
            const res = await axios.get(`http://localhost:5000/api/consultarCuenta/${mesaConsulta}`);
            if (res.data.success) {
                setResultadoAdeudo(res.data);
            } else {
                setResultadoAdeudo({ error: true, mensaje: "No se pudo obtener la información de la cuenta." });
            }
        } catch (err) {
            setResultadoAdeudo({ error: true, mensaje: "Error de conexión con la base de datos." });
        } finally {
            setCargandoAdeudo(false);
        }
    };

    return (
        <div className="hostes-container">
            <h1 className="hostes-titulo">Control de Mesas Interactivo</h1>
            <p className="hostes-descripcion">
                Monitorea el restaurante en tiempo real. <br />
                <span style={{ color: "#2e7d32", fontWeight: "bold" }}>Verde = Disponible</span> (Clic para ocupar y generar código) | 
                <span style={{ color: "#c62828", fontWeight: "bold" }}> Rojo = Ocupada</span> (Clic para liberar)
            </p>

            {error && <div className="tarjeta-error">⚠️ {error}</div>}

            {/* MAPA DE MESAS EN GRID */}
            <div className="mapa-mesas-grid">
                {todasLasMesas.map((mesa) => (
                    <button
                        key={mesa.id}
                        className={`tarjeta-mesa-interactiva ${mesa.ocupada ? "estado-ocupada" : "estado-libre"}`}
                        onClick={() => handleMesaClick(mesa.id)}
                        disabled={cargando}
                    >
                        <div className="header-mesa">
                            Mesa #{mesa.id}
                        </div>
                        
                        <div className="cuerpo-mesa">
                            {mesa.ocupada ? (
                                <div className="animacion-entrada" style={{ width: "100%", textAlign: "center" }}>
                                    <span className="tag-estado">Ocupada</span>
                                    <div className="codigo-display">{mesa.codigo}</div>
                                    <span className="indicador-accion">Click para Liberar</span>
                                </div>
                            ) : (
                                <div style={{ width: "100%", textAlign: "center" }}>
                                    <span className="tag-estado">Disponible</span>
                                    <div className="codigo-display-vacio">-- --</div>
                                    <span className="indicador-accion">Click para Ocupar</span>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════
                🔥 NUEVA SECCIÓN: VERIFICADOR DE ADEUDOS (HOSTESS)
                ══════════════════════════════════════════════════════════ */}
            <hr className="divisor-seccion" />
            
            <div className="verificador-adeudos-container">
                <h2 className="titulo-adeudos">🔍 Verificar Adeudos por Mesa</h2>
                <p className="descripcion-adeudos">Antes de liberar una mesa en rojo, confirma que su cuenta esté en ceros.</p>
                
                <form onSubmit={revisarAdeudo} className="formulario-adeudo">
                    <input
                        type="number"
                        min="1"
                        className="input-mesa-adeudo"
                        placeholder="Ingresa el No. de Mesa..."
                        value={mesaConsulta}
                        onChange={(e) => setMesaConsulta(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-revisar-adeudo" disabled={cargandoAdeudo}>
                        {cargandoAdeudo ? "Buscando..." : "Revisar Cuenta"}
                    </button>
                </form>

                {/* CAJA DE RESULTADOS DEL ADEUDO */}
                {resultadoAdeudo && !resultadoAdeudo.error && (
                    <div className={`resultado-caja ${resultadoAdeudo.total > 0 ? 'adeudo-pendiente' : 'adeudo-limpio'}`}>
                        {resultadoAdeudo.total > 0 ? (
                            <>
                                <h3 className="alerta-titulo">⚠️ Adeudo Pendiente en Mesa #{mesaConsulta}</h3>
                                <p className="monto-deuda">Total sin pagar: <strong>${resultadoAdeudo.total}.00 MXN</strong></p>
                                <p className="estado-deuda">Estatus en sistema: {resultadoAdeudo.estatus ? resultadoAdeudo.estatus.toUpperCase() : 'DESCONOCIDO'}</p>
                                <div className="alerta-bloqueo">❌ ¡NO LIBERES ESTA MESA! El cliente aún no liquida en caja.</div>
                            </>
                        ) : (
                            <>
                                <h3 className="limpio-titulo">✅ Mesa #{mesaConsulta} Libre de Adeudos</h3>
                                <p className="texto-limpio">No se encontraron cuentas activas, pedidos en cocina ni solicitudes de cobro pendientes.</p>
                                <div className="alerta-pase">✨ Es seguro liberar la mesa en el mapa.</div>
                            </>
                        )}
                    </div>
                )}

                {resultadoAdeudo && resultadoAdeudo.error && (
                    <div className="resultado-caja adeudo-error">
                        <p>❌ {resultadoAdeudo.mensaje}</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Hostes;