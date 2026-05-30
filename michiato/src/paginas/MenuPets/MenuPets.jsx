import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Plus, X } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./MenuPets.css";
import productosData from "../../data/productos.json";
import { useCart } from "../../context/cartContext";

const categorias = [
    { key: "dogMenu",   titulo: "Menú Perros",        navLabel: "Dog Menu", emoji: "🐶" },
    { key: "catMenu",   titulo: "Menú Gatos",         navLabel: "Cat Menu", emoji: "🐱" },
    { key: "petsSnack", titulo: "Snacks para Mascotas", navLabel: "Snacks",  emoji: "🦴" },
];

const MenuPets = () => {
    const { agregarAlCarrito } = useCart();
    const sectionRefs = useRef({});

    // Estado del modal
    const [productoModal, setProductoModal] = useState(null);

    const scrollToSection = (key) => {
        sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const abrirModal  = (producto) => setProductoModal(producto);
    const cerrarModal = () => setProductoModal(null);

    return (
        <div className="pets-layout">

            {/* ── Sidebar sticky ── */}
            <aside className="pets-sidebar">
                <p className="sidebar-titulo">MENÚ</p>
                <nav className="sidebar-nav">
                    {categorias.map((cat) => (
                        <button
                            key={cat.key}
                            className="sidebar-item"
                            onClick={() => scrollToSection(cat.key)}
                        >
                            <span className="sidebar-emoji">{cat.emoji}</span>
                            <span className="sidebar-label">{cat.navLabel}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── Contenido principal ── */}
            <main className="pets-main">
                {categorias.map((cat, index) => {
                    const productos = productosData[cat.key];
                    if (!productos || productos.length === 0) return null;

                    const prevClass = `flecha-prev-${cat.key}`;
                    const nextClass = `flecha-next-${cat.key}`;
                    const pagClass  = `paginacion-fraccion-${cat.key}`;

                    return (
                        <section
                            key={cat.key}
                            className={`seccion-pets tono-${index % 3}`}
                            ref={(el) => (sectionRefs.current[cat.key] = el)}
                        >
                            <h2 className="titulo-categoria">{cat.titulo}</h2>

                            <div className="contenedor-carrusel">
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    spaceBetween={30}
                                    slidesPerView={3}
                                    navigation={{ nextEl: `.${nextClass}`, prevEl: `.${prevClass}` }}
                                    pagination={{ type: "fraction", el: `.${pagClass}` }}
                                    breakpoints={{
                                        320:  { slidesPerView: 1, spaceBetween: 20 },
                                        480:  { slidesPerView: 1, spaceBetween: 20 },
                                        640:  { slidesPerView: 2, spaceBetween: 25 },
                                        768:  { slidesPerView: 2, spaceBetween: 25 },
                                        1024: { slidesPerView: 3, spaceBetween: 30 },
                                        1280: { slidesPerView: 3, spaceBetween: 30 },
                                    }}
                                    className="swiper-pets"
                                >
                                    {productos.map((producto) => (
                                        <SwiperSlide key={producto.id}>
                                            <div className="tarjeta-menu">

                                                {/* Imagen clickeable */}
                                                <div
                                                    className="contenedor-img-organica img-clickeable"
                                                    onClick={() => abrirModal(producto)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === "Enter" && abrirModal(producto)}
                                                    aria-label={`Ver descripción de ${producto.nombre}`}
                                                >
                                                    <img
                                                        src={producto.imagen}
                                                        alt={producto.nombre}
                                                        className="img-menu"
                                                    />
                                                    <div className="img-overlay">
                                                        <span className="img-overlay-texto">Ver más</span>
                                                    </div>
                                                </div>

                                                <div className="info-menu">
                                                    <h3 className="nombre-producto">{producto.nombre}</h3>
                                                    <div className="fila-precio-boton">
                                                        <p className="precio-producto">${producto.precio}.00 MXN</p>
                                                        <button
                                                            className="btn-agregar"
                                                            onClick={() => agregarAlCarrito(producto)}
                                                            aria-label={`Agregar ${producto.nombre}`}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                <div className="controles-carrusel-inferior">
                                    <button className={`flecha-custom ${prevClass}`} aria-label="Anterior">&#10094;</button>
                                    <div className={pagClass}></div>
                                    <button className={`flecha-custom ${nextClass}`} aria-label="Siguiente">&#10095;</button>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </main>

            {/* ── Modal de descripción ── */}
            {productoModal && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-tarjeta" onClick={(e) => e.stopPropagation()}>

                        <button className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar">
                            <X size={20} />
                        </button>

                        <div className="modal-img-organica">
                            <img src={productoModal.imagen} alt={productoModal.nombre} />
                        </div>

                        <div className="modal-info">
                            <h3 className="modal-nombre">{productoModal.nombre}</h3>
                            <p className="modal-descripcion">{productoModal.descripcion}</p>
                            <div className="modal-footer">
                                <span className="modal-precio">${productoModal.precio}.00 MXN</span>
                                <button
                                    className="btn-agregar modal-btn-agregar"
                                    onClick={() => {
                                        agregarAlCarrito(productoModal);
                                        cerrarModal();
                                    }}
                                >
                                    <Plus size={16} />
                                    Agregar
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default MenuPets;