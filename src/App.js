import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Waluty from './pages/Waluty/Waluty';
import WalutyDetails from './pages/WalutyDetails/WalutyDetails';
import CenaZlota from './pages/CenaZlota/CenaZlota';
import Autor from './pages/Autor/Autor';

export default function App() {
  return (
    <Router>
      <div className='main'>
        <div className="navbar">
            <NavLink to="/waluty" className={({ isActive }) => isActive ? 'active' : ''}>
              Kursy Walut
            </NavLink>
            <NavLink to="/cena-zlota" className={({ isActive }) => isActive ? 'active' : ''}>
              Cena Złota
            </NavLink>
            <NavLink to="/autor" className={({ isActive }) => isActive ? 'active' : ''}>
              O Autorze
            </NavLink>
        </div>
        <div className="content">
          <Routes>
            <Route path="/waluty" element={<Waluty />} />
            <Route path="/waluty/:code" element={<WalutyDetails />} />
            <Route path="/cena-zlota" element={<CenaZlota />} />
            <Route path="/autor" element={<Autor />} />
            <Route path="/" element={<Waluty />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
