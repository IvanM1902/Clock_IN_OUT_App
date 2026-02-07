import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Terminal from './pages/Terminal';
import Admin from './pages/Admin';

function App() {
  // Generiraj UUID čim se aplikacija pokrene (bilo na adminu ili terminalu)
  useEffect(() => {
    let uuid = localStorage.getItem('terminal_uuid');
    if (!uuid) {
      // Generira unikatan ID (npr. DEV-X8A2B9C)
      uuid = 'DEV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('terminal_uuid', uuid);
      console.log("Novi uređaj identificiran:", uuid);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Terminal />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;