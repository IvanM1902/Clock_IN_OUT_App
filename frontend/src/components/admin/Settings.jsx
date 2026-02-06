import { useState } from 'react';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const API_SETTINGS = "http://192.168.0.53:8080/api/settings"; // Tvoj lokalni IP

  const updateSalonIp = async () => {
    if (!window.confirm("Želite li postaviti trenutnu mrežu kao jedinu dozvoljenu za rad Terminala?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_SETTINGS}/update-ip`, { method: 'POST' });
      const msg = await res.text();
      alert(msg);
    } catch (err) {
      alert("Greška: Provjerite je li backend pokrenut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-black mb-6 italic text-gray-700 uppercase tracking-tighter">Postavke Sustava</h2>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-orange-100 p-4 rounded-2xl text-2xl">📍</div>
          <div>
            <h3 className="text-xl font-black text-gray-800">Lokacija Salona</h3>
            <p className="text-gray-400 text-sm font-medium">Ograničite pristup Terminalu samo na vašu mrežu.</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase mb-4 leading-relaxed">
            Ako se ruter u salonu resetira ili promijeni IP adresu, radnici se neće moći prijaviti.
            Tada trebate doći u salon, spojiti se na WiFi i kliknuti gumb ispod.
          </p>

          <button
            onClick={updateSalonIp}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black uppercase transition-all shadow-lg ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
            }`}
          >
            {loading ? 'Ažuriranje...' : '📍 Postavi trenutni IP kao salon'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest justify-center">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Sustav je aktivan i prati lokaciju
        </div>
      </div>
    </div>
  );
};

export default Settings;