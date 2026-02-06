import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ActiveStaff from '../components/admin/ActiveStaff';
import FullHistory from '../components/admin/FullHistory';
import ManageStaff from '../components/admin/ManageStaff';
import EmployeeAnalytics from '../components/admin/EmployeeAnalytics';
import Settings from '../components/admin/Settings';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'tata123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else { alert("Kriva lozinka!"); }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <h2 className="text-xl font-black mb-4 text-center uppercase tracking-widest text-gray-800">Admin Ulaz</h2>
          <input type="password" title="Lozinka" className="border p-4 w-full mb-4 rounded-xl" placeholder="Lozinka" onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-blue-600 text-white w-full py-4 rounded-xl font-black uppercase shadow-lg shadow-blue-200">Prijavi se</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar Navigacija */}
      <div className="w-full md:w-64 bg-gray-800 text-white p-6 flex flex-col shadow-xl">
        <h1 className="text-2xl font-black mb-8 text-blue-400 border-b border-gray-700 pb-4 hidden md:block italic">ADMIN PANEL</h1>
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
          <Link to="/admin/active" className="p-3 rounded-xl hover:bg-gray-700 transition font-bold whitespace-nowrap">🟢 Status</Link>
          <Link to="/admin/history" className="p-3 rounded-xl hover:bg-gray-700 transition font-bold whitespace-nowrap">📋 Povijest</Link>
          <Link to="/admin/staff" className="p-3 rounded-xl hover:bg-gray-700 transition font-bold whitespace-nowrap">👥 Radnici</Link>
          <Link to="/admin/analytics" className="p-3 rounded-xl hover:bg-gray-700 transition font-bold whitespace-nowrap">📊 Izvještaji</Link>
          <Link to="/admin/settings" className="p-3 rounded-xl hover:bg-gray-700 transition font-bold whitespace-nowrap">⚙️ Postavke</Link>
          <button onClick={handleLogout} className="p-3 rounded-xl bg-red-900/30 text-red-400 font-bold md:mt-auto">Odjava</button>
        </nav>
      </div>

      {/* Sadržaj - Ovdje se učitavaju ostali fileovi */}
      <div className="flex-1 p-4 md:p-10">
        <Routes>
          <Route path="active" element={<ActiveStaff />} />
          <Route path="history" element={<FullHistory />} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="analytics" element={<EmployeeAnalytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="/" element={<div className="text-center mt-20 text-gray-400 font-bold italic text-xl">Dobrodošli, šefe. Odaberite opciju iz izbornika.</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;