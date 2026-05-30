// src/componentes/Footer/Footer.jsx
import React from 'react';
import './Footer.css';
import { FaWhatsapp, FaInstagram, FaTiktok, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Dirección */}
        <div className="footer-direccion">
          <h3 className="footer-titulo">Encuéntranos</h3>
          <p>Blvd. Marcelino García Barragán 1421</p>
          <p>CUCEI, Universidad de Guadalajara</p>
          <p>Guadalajara, Jalisco, México</p>
        </div>

        {/* Redes sociales */}
        <div className="footer-redes">
          <a
            href="https://wa.me/523310000000"
            target="_blank"
            rel="noopener noreferrer"
            className="red-social"
            aria-label="WhatsApp"
          >
            <FaWhatsapp />
          </a>

          <a
            href="https://www.instagram.com/cafeteria.michiato"
            target="_blank"
            rel="noopener noreferrer"
            className="red-social"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>

          <a
            href="https://www.tiktok.com/@cafeteria.michiato"
            target="_blank"
            rel="noopener noreferrer"
            className="red-social"
            aria-label="TikTok"
          >
            <FaTiktok />
          </a>

          <a
            href="mailto:contacto@cafeteriamichiato.com"
            className="red-social"
            aria-label="Correo electrónico"
          >
            <FaEnvelope />
          </a>
        </div>

        {/* Legal */}
        <div className="footer-legal">
          <p>© 2026, <a href="/">Cafeteria Michiato</a>. Todos los derechos reservados.</p>
          <a href="/politica-privacidad" className="privacy-link">Política de privacidad</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;