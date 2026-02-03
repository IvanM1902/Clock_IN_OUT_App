import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Terminal from './pages/Terminal';
import Admin from './pages/Admin';

function App() {
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