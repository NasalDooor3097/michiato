import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Plus, X } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Breakfasts.css";
import productosData from "../../../data/productos.json";
import { useCart } from "../../../context/cartContext";

const Breakfasts = () => {
    const desayunos = productosData.breakfasts;
    const { agregarAlCarrito } = useCart();
    const [productoModal, setProductoModal] = useState(null);

    return (
        <section className="seccion-desayunos">
            <h2 className="titulo-categoria">Desayunos</h2>

            <div className="contenedor-carrusel">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={4}
                    navigation={{ nextEl: ".flecha-next", prevEl: ".flecha-prev" }}
                    pagination={{ type: "fraction", el: ".paginacion-fraccion" }}
                    breakpoints={{
                        320:  { slidesPerView: 1, spaceBetween: 20 },
                        480:  { slidesPerView: 1, spaceBetween: 20 },
                        640:  { slidesPerView: 2, spaceBetween: 25 },
                        768:  { slidesPerView: 2, spaceBetween: 25 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                        1280: { slidesPerView: 4, spaceBetween: 30 },
                    }}
                    className="swiper-desayunos"
                >
                    {desayunos.map((platillo) => (
                        <SwiperSlide key={platillo.id}>
                            <div className="tarjeta-menu">
                                <div
                                    className="contenedor-img-organica img-clickeable"
                                    onClick={() => setProductoModal(platillo)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === "Enter" && setProductoModal(platillo)}
                                    aria-label={`Ver descripción de ${platillo.nombre}`}
                                >
                                    <img src={platillo.imagen} alt={platillo.nombre} className="img-menu" />
                                    <div className="img-overlay">
                                        <span className="img-overlay-texto">Ver más</span>
                                    </div>
                                </div>
                                <div className="info-menu">
                                    <h3 className="nombre-producto">{platillo.nombre}</h3>
                                    <div className="fila-precio-boton">
                                        <p className="precio-producto">${platillo.precio}.00 MXN</p>
                                        <button
                                            className="btn-agregar"
                                            onClick={() => agregarAlCarrito(platillo)}
                                            aria-label={`Agregar ${platillo.nombre}`}
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
                    <button className="flecha-custom flecha-prev" aria-label="Anterior">&#10094;</button>
                    <div className="paginacion-fraccion"></div>
                    <button className="flecha-custom flecha-next" aria-label="Siguiente">&#10095;</button>
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

export default Breakfasts;