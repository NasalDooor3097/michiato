import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Plus, X } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Mocktails.css";
import productosData from "../../../data/productos.json";
import { useCart } from "../../../context/cartContext";

const Mocktails = () => {
    const mocktails = productosData.mocktails;
    const { agregarAlCarrito } = useCart();
    const [productoModal, setProductoModal] = useState(null);

    return (
        <section className="seccion-mocktails">
            <h2 className="titulo-categoria">Bebidas Preparadas</h2>

            <div className="contenedor-carrusel">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={4}
                    navigation={{ nextEl: ".flecha-next-mocktails", prevEl: ".flecha-prev-mocktails" }}
                    pagination={{ type: "fraction", el: ".paginacion-fraccion-mocktails" }}
                    breakpoints={{
                        320:  { slidesPerView: 1, spaceBetween: 20 },
                        480:  { slidesPerView: 1, spaceBetween: 20 },
                        640:  { slidesPerView: 2, spaceBetween: 25 },
                        768:  { slidesPerView: 2, spaceBetween: 25 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                        1280: { slidesPerView: 4, spaceBetween: 30 },
                    }}
                    className="swiper-mocktails"
                >
                    {mocktails.map((mocktail) => (
                        <SwiperSlide key={mocktail.id}>
                            <div className="tarjeta-menu">
                                <div
                                    className="contenedor-img-organica img-clickeable"
                                    onClick={() => setProductoModal(mocktail)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && setProductoModal(mocktail)}
                                    aria-label={`Ver descripción de ${mocktail.nombre}`}
                                >
                                    <img src={mocktail.imagen} alt={mocktail.nombre} className="img-menu" />
                                    <div className="img-overlay">
                                        <span className="img-overlay-texto">Ver más</span>
                                    </div>
                                </div>
                                <div className="info-menu">
                                    <h3 className="nombre-producto">{mocktail.nombre}</h3>
                                    <div className="fila-precio-boton">
                                        <p className="precio-producto">${mocktail.precio}.00 MXN</p>
                                        <button
                                            className="btn-agregar"
                                            onClick={() => agregarAlCarrito(mocktail)}
                                            aria-label={`Agregar ${mocktail.nombre} al carrito`}
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
                    <button className="flecha-custom flecha-prev-mocktails" aria-label="Anterior">&#10094;</button>
                    <div className="paginacion-fraccion-mocktails"></div>
                    <button className="flecha-custom flecha-next-mocktails" aria-label="Siguiente">&#10095;</button>
                </div>
            </div>

            {productoModal && (
                <div className="modal-overlay" onClick={() => setProductoModal(null)}>
                    <div className="modal-tarjeta" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-cerrar" onClick={() => setProductoModal(null)} aria-label="Cerrar"><X size={20} /></button>
                        <div className="modal-img-organica">
                            <img src={productoModal.imagen} alt={productoModal.nombre} />
                        </div>
                        <div className="modal-info">
                            <h3 className="modal-nombre">{productoModal.nombre}</h3>
                            <p className="modal-descripcion">{productoModal.descripcion}</p>
                            <div className="modal-footer">
                                <span className="modal-precio">${productoModal.precio}.00 MXN</span>
                                <button className="btn-agregar modal-btn-agregar" onClick={() => { agregarAlCarrito(productoModal); setProductoModal(null); }}>
                                    <Plus size={16} /> Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Mocktails;