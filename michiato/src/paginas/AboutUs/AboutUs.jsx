import React, { useEffect, useRef } from "react";
import "./AboutUs.css";

/* ── Iconos SVG inline para no depender de nada externo ── */
const IconMision = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-icon-svg">
    <path d="M20 4 L8 32 H32 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
    <path d="M16 32 V26 Q20 22 24 26 V32" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="29" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M29 7 V4 M32 10 H35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconVision = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-icon-svg">
    <ellipse cx="20" cy="20" rx="14" ry="9" stroke="currentColor" strokeWidth="2.2"/>
    <circle cx="20" cy="20" r="4.5" stroke="currentColor" strokeWidth="2.2"/>
    <path d="M20 6 V3 M20 37 V34 M6 20 H3 M37 20 H34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconValores = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-icon-svg">
    <path d="M20 6 L26 14 H36 L28 22 L31 34 L20 27 L9 34 L12 22 L4 14 H14 Z"
      stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
  </svg>
);

/* ── Hoja decorativa SVG ── */
const Leaf = ({ className }) => (
  <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30 75 Q5 50 10 20 Q20 5 30 8 Q40 5 50 20 Q55 50 30 75Z"
      fill="currentColor" opacity="0.18"/>
    <path d="M30 75 Q30 40 30 8" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
  </svg>
);

/* ── Pétalo de sakura SVG ── */
const Petal = ({ style }) => (
  <svg viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="sakura-petal" style={style}>
    <path d="M15 2 C22 2 28 8 28 16 C28 24 22 32 15 32 C8 32 2 24 2 16 C2 8 8 2 15 2Z"
      fill="#f5b8c8" opacity="0.82"/>
    <path d="M15 2 C15 2 15 17 15 32" stroke="#e8899e" strokeWidth="0.8" opacity="0.5"/>
    <path d="M2 16 C2 16 15 14 28 16" stroke="#e8899e" strokeWidth="0.8" opacity="0.4"/>
    <circle cx="15" cy="16" r="2.5" fill="#fce4ec" opacity="0.9"/>
  </svg>
);

/* Genera N pétalos con posiciones y tiempos aleatorios pero fijos (seeded) */
const PETALS = Array.from({ length: 28 }, (_, i) => {
  const seed = i * 137.508; // golden angle spread
  return {
    id: i,
    left:  `${(seed * 3.7) % 100}%`,
    delay: `${(seed * 0.11) % 9}s`,
    dur:   `${6 + (seed * 0.07) % 6}s`,
    size:  `${16 + (i % 5) * 5}px`,
    swing: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 15)}px`,
    rot:   `${(seed * 2.3) % 360}deg`,
  };
});

/* ── Pata decorativa ── */
const PawPrint = ({ className }) => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="25" cy="30" rx="9" ry="10" fill="currentColor" opacity="0.7"/>
    <ellipse cx="12" cy="20" rx="5" ry="6" fill="currentColor" opacity="0.6"/>
    <ellipse cx="38" cy="20" rx="5" ry="6" fill="currentColor" opacity="0.6"/>
    <ellipse cx="18" cy="13" rx="4" ry="5" fill="currentColor" opacity="0.5"/>
    <ellipse cx="32" cy="13" rx="4" ry="5" fill="currentColor" opacity="0.5"/>
  </svg>
);

const cards = [
  {
    id: "mision",
    label: "Misión",
    Icon: IconMision,
    color: "#4a7c59",
    bg: "#eef5f0",
    text:
      "Ofrecer un espacio de convivencia armónica con mascotas, actuando bajo un modelo de negocio responsable que actúe como plataforma para mejorar la calidad de vida animal.",
  },
  {
    id: "vision",
    label: "Visión",
    Icon: IconVision,
    color: "#c0504a",
    bg: "#fdf0ef",
    text:
      "Ser la cafetería petfriendly líder en Guadalajara, reconocida por excelencia operativa y su impacto positivo en el rescate y bienestar animal de la región.",
  },
  {
    id: "valores",
    label: "Valores",
    Icon: IconValores,
    color: "#c9900a",
    bg: "#fdf8ec",
    text:
      "En nuestra comunidad y hacia los animales los valores son: respeto, calidad, calidez, compromiso social, transparencia en la ayuda y empatía.",
  },
];

const valores = [
  { emoji: "🐾", label: "Pet‑friendly" },
  { emoji: "☕", label: "Calidad" },
  { emoji: "🤝", label: "Compromiso" },
  { emoji: "💚", label: "Empatía" },
  { emoji: "✨", label: "Calidez" },
  { emoji: "🔍", label: "Transparencia" },
];

const AboutUs = () => {
  /* Animación de entrada al hacer scroll */
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.15 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const addRef = (i) => (el) => { refs.current[i] = el; };

  return (
    <main className="about-page">

      {/* ══════════ HERO ══════════ */}
      <section className="about-hero">
        {/* ── Lluvia de sakura ── */}
        <div className="sakura-rain" aria-hidden="true">
          {PETALS.map((p) => (
            <Petal key={p.id} style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.dur,
              animationDelay: p.delay,
              '--swing': p.swing,
              '--rot': p.rot,
            }} />
          ))}
        </div>

        {/* Decoraciones fondo */}
        <Leaf className="deco-leaf deco-leaf--tl" />
        <Leaf className="deco-leaf deco-leaf--tr" />
        <Leaf className="deco-leaf deco-leaf--bl" />
        <Leaf className="deco-leaf deco-leaf--br" />
        <PawPrint className="deco-paw deco-paw--1" />
        <PawPrint className="deco-paw deco-paw--2" />

        <div className="hero-inner">
          <span className="hero-eyebrow">Cafetería Michiato</span>
          <h1 className="hero-titulo">
            Quiénes<br />
            <em>somos</em>
          </h1>
          <p className="hero-descripcion">
            Somos más que una cafetería. Somos un refugio cálido donde las personas
            y sus mascotas encuentran un lugar propio: buena comida, buen café y
            el ronroneo de saber que cada visita ayuda a mejorar la vida de los
            animales de nuestra comunidad.
          </p>
          <div className="hero-divider">
            <span />
            <PawPrint className="divider-paw" />
            <span />
          </div>
        </div>
      </section>

      {/* ══════════ HISTORIA ══════════ */}
      <section className="about-historia" ref={addRef(0)}>
        <div className="historia-inner reveal">
          <div className="historia-texto">
            <h2 className="section-titulo">Nuestra historia</h2>
            <p>
              Cafetería Michiato nació en el corazón universitario de Guadalajara,
              junto al CUCEI, con una idea sencilla pero poderosa: crear un espacio
              donde estudiantes, familias y amantes de los animales pudieran disfrutar
              de una experiencia gastronómica sin dejar a sus mascotas en casa.
            </p>
            <p>
              Desde nuestros primeros días, supimos que queríamos ir más allá del
              negocio. Por eso, una parte de cada venta se destina directamente al
              rescate y bienestar animal en la región. En Michiato, cada taza de café
              tiene un propósito.
            </p>
          </div>
          <div className="historia-badge">
            <div className="badge-ring">
              <span className="badge-emoji">🐈</span>
              <p className="badge-texto">Pet<br/>Friendly</p>
            </div>
            <Leaf className="badge-leaf badge-leaf--l" />
            <Leaf className="badge-leaf badge-leaf--r" />
          </div>
        </div>
      </section>

      {/* ══════════ MISIÓN / VISIÓN / VALORES ══════════ */}
      <section className="about-mvv">
        <div className="mvv-header" ref={addRef(1)}>
          <PawPrint className="mvv-paw reveal" />
        </div>

        <div className="mvv-grid">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="mvv-card reveal"
              ref={addRef(2 + i)}
              style={{ "--card-color": card.color, "--card-bg": card.bg, animationDelay: `${i * 0.12}s` }}
            >
              {/* Hojas esquina */}
              <Leaf className="card-leaf card-leaf--bl" />
              <Leaf className="card-leaf card-leaf--br" />

              {/* Header de la tarjeta */}
              <div className="card-header">
                <div className="card-icon-wrap">
                  <card.Icon />
                </div>
                <h3 className="card-label">{card.label}</h3>
              </div>

              {/* Texto */}
              <p className="card-texto">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ PÍLDORAS DE VALORES ══════════ */}
      <section className="about-pilares" ref={addRef(5)}>
        <div className="pilares-inner reveal">
          <h2 className="section-titulo section-titulo--center">Lo que nos mueve</h2>
          <div className="pilares-grid">
            {valores.map((v, i) => (
              <div className="pilar" key={v.label} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="pilar-emoji">{v.emoji}</span>
                <span className="pilar-label">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
};

export default AboutUs;