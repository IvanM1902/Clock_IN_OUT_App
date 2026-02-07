import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentNow: 0,
    lastActivity: null
  });

  useEffect(() => {
    // Dohvati sve radnike za ukupan broj
    fetch(`${API_BASE}/employees`)
      .then(res => res.json())
      .then(emps => {
        setStats(prev => ({ ...prev, totalEmployees: emps.length }));
      });

    // Dohvati status za trenutno prisutne i zadnju aktivnost
    fetch(`${API_BASE}/attendance/status`)
      .then(res => res.json())
      .then(logs => {
        const present = logs.filter(l => l.type === 'IN').length;
        const last = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        setStats(prev => ({ ...prev, presentNow: present, lastActivity: last }));
      });
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-black mb-8 text-gray-700 uppercase italic tracking-tighter">Pregled Salona</h2>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Ukupno radnika</p>
          <h4 className="text-5xl font-black text-gray-800">{stats.totalEmployees}</h4>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 border-t-8 border-t-green-500">
          <p className="text-[10px] font-black text-green-600 uppercase mb-2">Trenutno u salonu</p>
          <h4 className="text-5xl font-black text-gray-800">{stats.presentNow}</h4>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Zadnja aktivnost</p>
          {stats.lastActivity ? (
            <div>
              <p className="font-bold text-gray-700">{stats.lastActivity.employee.name}</p>
              <p className="text-xs text-gray-400">{stats.lastActivity.type === 'IN' ? 'Prijava' : 'Odjava'} u {new Date(stats.lastActivity.timestamp).toLocaleTimeString()}</p>
            </div>
          ) : <p className="italic text-gray-300">Nema zapisa</p>}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/active" className="group bg-gray-900 p-8 rounded-[40px] text-white hover:bg-blue-600 transition-all">
          <h3 className="text-2xl font-black mb-2 uppercase">Provjeri tko radi →</h3>
          <p className="text-gray-400 group-hover:text-blue-100">Vidi detaljan status svih zaposlenika u stvarnom vremenu.</p>
        </Link>

        <Link to="/admin/history" className="group bg-white p-8 rounded-[40px] border border-gray-200 hover:border-blue-500 transition-all">
          <h3 className="text-2xl font-black mb-2 uppercase text-gray-800">Povijest prijava →</h3>
          <p className="text-gray-500">Pregledaj sve zapise i filtriraj po datumima.</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;