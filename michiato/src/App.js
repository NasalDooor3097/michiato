import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import NavBar from './componentes/NavBar/NavBar.jsx';
import Home from './paginas/Home/Home.jsx';
import Footer from './componentes/Footer/Footer.jsx';
import Menu from './paginas/Menu/Menu.jsx'; 
import AboutUs from './paginas/AboutUs/AboutUs.jsx';
import Hostes from './paginas/Hostes/Hostes.jsx';
import Pedidos from './paginas/Pedidos/Pedidos.jsx';
import LogIn from './paginas/LogIn/LogIn.jsx';
import SingIn from './paginas/SingIn/SingIn.jsx';
import User from './paginas/User/User.jsx';
import MenuPets from './paginas/MenuPets/MenuPets.jsx';
import { AuthProvider } from './context/authContext.jsx';
import { CartProvider } from './context/cartContext.jsx';
import './App.css';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
        <AuthProvider>
          <CartProvider>
            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path='/menu' element={<Menu />} />
              <Route path='/about-us' element={<AboutUs />} />
              <Route path='/hostesSecretKey=1234567899876543210' element={<Hostes />} />
              <Route path='/pedidosSecretKey=9876543211234567890' element={<Pedidos />} />
              <Route path='/signup' element={<SingIn />} />
              <Route path='/login' element={<LogIn />} />
              <Route path='/user' element={<User />} />
              <Route path='/menu-pets' element={<MenuPets />} />
            </Routes>
          <Footer />
        </CartProvider>
        </AuthProvider>
        </Router>
        
      </header>
    </div>
  );
}

export default App;
