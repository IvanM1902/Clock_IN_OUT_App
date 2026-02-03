import { useState, useEffect } from 'react';

const API_TERMINALS = "http://192.168.0.53:8080/api/terminals";

function ManageDevices() {
  const [devices, setDevices] = useState([]);

  const fetchDevs = () => fetch(API_TERMINALS).then(res => res.json()).then(setDevices);

  useEffect(() => {
    fetchDevs();
  }, []);

  const deleteDev = async (id) => {
    if (window.confirm("Trajno ukloniti pristup ovom uređaju? Radnik se više neće moći prijaviti s njega.")) {
      await fetch(`${API_TERMINALS}/${id}`, { method: 'DELETE' });
      fetchDevs();
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-black mb-6 italic text-gray-700 uppercase tracking-tighter">Autorizirani Uređaji</h2>

      {/* Kartica s kodom */}
      <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-200 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Kod za nove uređaje:</p>
          <h3 className="text-5xl font-black tracking-widest uppercase">SALON-2024</h3>
          <p className="mt-4 text-xs font-medium opacity-70 italic">* Ovaj kod ukucajte na novom uređaju za pristup terminalu.</p>
        </div>
        {/* Dekorativni krugovi */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
      </div>

      <div className="grid gap-4">
        {devices.map(d => (
          <div key={d.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-blue-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-2xl text-2xl group-hover:bg-blue-50 transition-colors">📱</div>
              <div>
                <p className="text-xl font-black text-gray-800">{d.deviceName}</p>
                <p className="text-[10px] text-gray-400 font-bold font-mono uppercase tracking-tighter">Key: {d.deviceKey.substring(0, 12)}...</p>
              </div>
            </div>
            <button
              onClick={() => deleteDev(d.id)}
              className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
              title="Ukloni uređaj"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {devices.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold italic">
            Nema povezanih uređaja.
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageDevices;