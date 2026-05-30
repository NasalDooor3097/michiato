import React, { useState, useEffect, useRef } from "react";
import "./Menu.css";
import Breackfasts from "../../componentes/Products/Breakfasts/Breakfasts.jsx";
import Salads from "../../componentes/Products/Salads/Salads.jsx";
import Coffees from "../../componentes/Products/Coffees/Coffees.jsx";
import Mocktails from "../../componentes/Products/Mocktails/Mocktails.jsx";
import Watters from "../../componentes/Products/Watters/Watters.jsx";

const categories = [
  { id: "breakfasts", label: "Breakfasts", emoji: "🍳" },
  { id: "salads",     label: "Salads",     emoji: "🥗" },
  { id: "coffees",    label: "Coffees",    emoji: "☕" },
  { id: "mocktails",  label: "Mocktails",  emoji: "🍹" },
  { id: "watters",    label: "Waters",     emoji: "💧" },
];

const Menu = () => {
  const [active, setActive] = useState("breakfasts");

  const sectionRefs = {
    breakfasts: useRef(null),
    salads:     useRef(null),
    coffees:    useRef(null),
    mocktails:  useRef(null),
    watters:    useRef(null),
  };

  // Scroll suave a la sección al hacer clic
  const scrollTo = (id) => {
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  // Detectar qué sección está visible para resaltar el nav
  useEffect(() => {
    const observers = categories.map(({ id }) => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 }
      );
      if (sectionRefs[id].current) observer.observe(sectionRefs[id].current);
      return observer;
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="menu-layout">
      {/* ── Barra lateral ── */}
      <nav className="menu-sidenav">
        <div className="sidenav-title">Menú</div>
        <ul>
          {categories.map(({ id, label, emoji }) => (
            <li key={id}>
              <button
                className={`sidenav-btn ${active === id ? "sidenav-btn--active" : ""}`}
                onClick={() => scrollTo(id)}
              >
                <span className="sidenav-emoji">{emoji}</span>
                <span className="sidenav-label">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Contenido del menú ── */}
      <main className="menu-content">
        <div ref={sectionRefs.breakfasts} className="sectionBoxBreakfasts menu-section">
          <Breackfasts />
        </div>
        <div ref={sectionRefs.salads} className="sectionBoxSalads menu-section">
          <Salads />
        </div>
        <div ref={sectionRefs.coffees} className="sectionBoxCoffees menu-section">
          <Coffees />
        </div>
        <div ref={sectionRefs.mocktails} className="sectionBoxMocktails menu-section">
          <Mocktails />
        </div>
        <div ref={sectionRefs.watters} className="sectionBoxWatters menu-section">
          <Watters />
        </div>
      </main>
    </div>
  );
};

export default Menu;