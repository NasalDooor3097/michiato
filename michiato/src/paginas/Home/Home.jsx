// src/paginas/Home/Home.jsx
import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

import fondoMichiato from '../../assets/BannerHomeMichiato/imgMichiato.png'; 

const Home = () => {
  return (
    <main className="home-container">
      <div className="imagen-fondo-wrapper">
        
        <img src={fondoMichiato} alt="Cafetería Michiato" className="imagen-fondo" />
        
        <div className="botones-flotantes">
          <Link to="/menu" className="btn-menu">
            Menú
          </Link>
          
          <Link to="/menu-pets" className="btn-menu">
            Menú Para tu mascota
          </Link>
        </div>

      </div>
    </main>
  );
};

export default Home;