import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const API_EMPLOYEES = `${API_BASE}/api/employees`;
const API_ATTENDANCE = `${API_BASE}/api/attendance`;

function ManageStaff() {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPins, setShowPins] = useState({});
  const [formData, setFormData] = useState({ name: '', surname: '', pin: '', role: '', hireDate: new Date().toISOString().split('T')[0] });

  const fetchEmps = () => fetch(API_EMPLOYEES).then(res => res.json()).then(setEmployees);
  useEffect(() => { fetchEmps(); }, []);

  const changePin = async (emp) => {
    const newPin = prompt(`Unesite novi PIN za ${emp.name} (4 znamenke):`, emp.pin);
    if (newPin && newPin.length === 4 && !isNaN(newPin)) {
      const res = await fetch(`${API_EMPLOYEES}/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, pin: newPin })
      });
      if (res.ok) { alert("PIN promijenjen!"); fetchEmps(); }
      else alert("PIN se već koristi!");
    } else if (newPin !== null) alert("Mora biti točno 4 znamenke!");
  };

  const add = async (e) => {
    e.preventDefault();
    if (formData.pin.length !== 4) return alert("PIN mora imati 4 znamenke!");
    const res = await fetch(API_EMPLOYEES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) { setIsModalOpen(false); setFormData({...formData, pin: '', name: '', surname: ''}); fetchEmps(); }
    else alert("Greška: PIN je zauzet!");
  };

  const deleteEmp = async (id) => { if (window.confirm("Obrisati radnika?")) { await fetch(`${API_EMPLOYEES}/${id}`, { method: 'DELETE' }); fetchEmps(); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black italic text-gray-700 uppercase tracking-tighter">Radni tim</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200">+ NOVI RADNIK</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(e => (
          <div key={e.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
            <span className="absolute top-4 right-4 text-[9px] font-black text-gray-400 uppercase">Zaposlen: {e.hireDate}</span>
            <p className="text-2xl font-black text-gray-800 leading-none mb-1">{e.name}</p>
            <p className="text-xl font-bold text-gray-400 mb-3">{e.surname}</p>
            <p className="text-[10px] font-black text-blue-500 uppercase mb-4">{e.role}</p>

            <div className="bg-gray-50 p-4 rounded-2xl mb-4 flex justify-between items-center border border-dashed border-gray-200">
              <span className="font-mono text-xl font-black text-blue-700 tracking-widest">{showPins[e.id] ? e.pin : '••••'}</span>
              <div className="flex gap-3">
                <button onClick={() => setShowPins(p => ({...p, [e.id]: !p[e.id]}))} className="text-[9px] font-black underline uppercase text-gray-400">Vidi</button>
                <button onClick={() => changePin(e)} className="text-[9px] font-black underline uppercase text-blue-600">Promijeni</button>
              </div>
            </div>
            <button onClick={() => deleteEmp(e.id)} className="w-full text-red-300 hover:text-red-500 font-bold text-[10px] uppercase transition-colors">Ukloni člana</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl scale-in">
            <h3 className="text-2xl font-black mb-6 text-center text-gray-800 uppercase italic">Novi radnik</h3>
            <form onSubmit={add} className="flex flex-col gap-3">
              <input required placeholder="Ime" className="border-2 p-3 rounded-2xl font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Prezime" className="border-2 p-3 rounded-2xl font-bold" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
              <input required placeholder="Uloga" className="border-2 p-3 rounded-2xl font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              <input required type="date" className="border-2 p-3 rounded-2xl font-bold" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
              <input required maxLength="4" inputMode="numeric" placeholder="PIN (4 broja)" className="border-2 p-3 rounded-2xl text-center text-2xl font-mono font-black text-blue-600" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} />
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-gray-400">Odustani</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 uppercase">Spremi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStaff;