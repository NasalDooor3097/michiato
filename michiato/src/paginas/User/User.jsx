// src/componentes/User/User.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Calendar } from 'lucide-react';
import axios from "axios";
import "./User.css";

const avataresPredefinidos = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Michiato&backgroundColor=f2efdd",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Cafe&backgroundColor=e6dfd3",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Latte&backgroundColor=f5ebeb",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Mocha&backgroundColor=e8ddcb",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Beto&backgroundColor=f2efdd"
];

const User = () => {
    const { usuario, estaAutenticado, setUsuarioContext, cerrarSesion } = useAuth();
    const { vaciarCarrito } = useCart();
    const navigate = useNavigate();

    const [tabActiva, setTabActiva] = useState("perfil");
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

    const [form, setForm] = useState({
        nombre: "",
        email: "",
        password: "",
        avatar: ""
    });

    useEffect(() => {
        if (!estaAutenticado) {
            navigate("/login");
        } else if (usuario) {
            setForm({
                nombre: usuario.nombre || "",
                email: usuario.email || "",
                password: "",
                avatar: usuario.avatar || avataresPredefinidos[0]
            });
            cargarHistorial();
        }
    }, [estaAutenticado, usuario, navigate]);

    const cargarHistorial = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/historial/${usuario.id_usuario}`);
            if (res.data.success) setHistorial(res.data.historial);
        } catch (err) { console.error("Error al cargar historial"); }
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            const res = await axios.put(`http://localhost:5000/api/user/${usuario.id_usuario}`, form);
            if (res.data.success) {
                setMensaje({ texto: "¡Perfil actualizado con éxito!", tipo: "exito" });
                setUsuarioContext(res.data.usuario); 
                setForm(prev => ({ ...prev, password: "" }));
            }
        } catch (error) {
            setMensaje({ texto: "Error al actualizar la información.", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    const handleCerrarSesion = () => {
        cerrarSesion();
        vaciarCarrito();
        navigate('/');
    };

    if (!usuario) return null;

    return (
        <div className="user-page-container">
            <div className="user-card-organica">
                
                <div className="user-header-blob">
                    <div className="avatar-wrapper">
                        <img src={form.avatar} alt="Mi Avatar" className="avatar-img-grande" />
                    </div>
                    <h1 className="user-nombre-titulo">Hola, {usuario.nombre.split(' ')[0]}</h1>
                    <p className="user-rol-sub">Miembro de la Familia Michiato</p>
                </div>

                <div className="user-tabs">
                    <button className={`tab-btn ${tabActiva === 'perfil' ? 'active' : ''}`} onClick={() => setTabActiva('perfil')}>Datos</button>
                    <button className={`tab-btn ${tabActiva === 'cupones' ? 'active' : ''}`} onClick={() => setTabActiva('cupones')}>Cupones</button>
                    <button className={`tab-btn ${tabActiva === 'historial' ? 'active' : ''}`} onClick={() => setTabActiva('historial')}>Compras</button>
                </div>

                <div className="tab-content">
                    {tabActiva === "perfil" && (
                        <form className="user-form fade-in" onSubmit={handleActualizar}>
                            <div className="selector-avatar-box">
                                <label>Elige tu Avatar</label>
                                <div className="avatar-opciones">
                                    {avataresPredefinidos.map((url, i) => (
                                        <img 
                                            key={i} src={url} alt={`Avatar ${i}`} 
                                            className={`avatar-opcion ${form.avatar === url ? 'seleccionado' : ''}`}
                                            onClick={() => setForm({...form, avatar: url})}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="form-group-organico">
                                <label>Nombre Completo</label>
                                <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                            </div>
                            <div className="form-group-organico">
                                <label>Correo Electrónico</label>
                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                            </div>
                            <div className="form-group-organico">
                                <label>Nueva Contraseña <span className="label-opcional">(Opcional)</span></label>
                                <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                            </div>
                            {mensaje.texto && <div className={`msg-alerta ${mensaje.tipo}`}>{mensaje.texto}</div>}
                            <button type="submit" className="btn-guardar-perfil" disabled={cargando}>{cargando ? "Guardando..." : "Guardar Cambios"}</button>
                            <button type="button" className="btn-cerrar-sesion" onClick={handleCerrarSesion}><LogOut size={18} /> Cerrar Sesión</button>
                        </form>
                    )}

                    {tabActiva === "cupones" && (
                        <div className="cupones-container fade-in">
                            <h3 className="titulo-cupones">Recompensas Michiato</h3>
                            {usuario.tiene_descuento ? (
                                <div className="cupon-tarjeta organica">
                                    <div className="cupon-izq"><span className="cupon-porcentaje">10%</span><span className="cupon-off">OFF</span></div>
                                    <div className="cupon-der">
                                        <h4>¡Regalo de Bienvenida!</h4>
                                        <p>Disfruta de un 10% de descuento en el total de tu próxima orden.</p>
                                        <span className="cupon-codigo-badge">ACTIVO EN TU CUENTA</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="cupon-vacio"><p>Por el momento no tienes cupones activos. ¡Sigue visitándonos!</p></div>
                            )}
                        </div>
                    )}

                    {tabActiva === "historial" && (
                        <div className="historial-container fade-in">
                            {historial.length === 0 ? <p className="text-center">Aún no tienes compras registradas.</p> :
                            historial.map((pedido) => (
                                <div key={pedido.id_pedido} className="pedido-card">
                                    <div className="pedido-header">
                                        <span><Calendar size={14}/> {new Date(pedido.fecha_pedido).toLocaleDateString()}</span>
                                        <span className="total-bold">${pedido.total}</span>
                                    </div>
                                    <div className="pedido-items">
                                        {pedido.productos.map((p, i) => (
                                            <p key={i}>{p.cantidad}x {p.nombre_producto}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default User;