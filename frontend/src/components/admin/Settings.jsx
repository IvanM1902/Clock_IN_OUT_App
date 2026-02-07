import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  // Dodajemo stanje za prikaz trenutnog ID-a radi lakše provjere
  const [myId, setMyId] = useState("");

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/all-devices`);
      const data = await res.json();
      setDevices(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDevices();
    setMyId(localStorage.getItem('terminal_uuid') || "Nije generiran");
  }, []);

  const authorizeCurrentDevice = async () => {
    const myUuid = localStorage.getItem('terminal_uuid');
    if (!deviceName.trim()) {
        alert("Molimo unesite ime uređaja");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings/authorize-this-device?uuid=${myUuid}&name=${encodeURIComponent(deviceName)}`, {
        method: 'POST'
      });
      const msg = await res.text();
      alert(msg);
      setDeviceName("");
      fetchDevices();
    } catch (err) {
      alert("Greška pri komunikaciji s backendom.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (id) => {
    if (!window.confirm("Želite li ukloniti pristup ovom uređaju?")) return;

    try {
      // Pazi na putanju: u tvom AppSettingsControlleru je /revoke-device/{id}
      await fetch(`${API_BASE}/settings/revoke-device/${id}`, { method: 'DELETE' });
      fetchDevices();
    } catch (err) {
      alert("Greška pri brisanju.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-black mb-8 uppercase italic text-gray-700">Postavke Terminala</h2>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10 text-center">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Vaš ID Uređaja</p>
        <p className="font-mono text-gray-400 mb-6 bg-gray-50 py-2 rounded-xl border border-dashed border-gray-200">{myId}</p>

        <input
          placeholder="Ime ovog uređaja"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          className="w-full p-4 mb-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
        />

        <button
          onClick={authorizeCurrentDevice}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:bg-gray-300"
        >
          {loading ? "Slanje..." : "AUTORIZIRAJ OVAJ UREĐAJ"}
        </button>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <h3 className="text-xl font-black text-gray-800 mb-6 uppercase text-center tracking-tighter">Lista Aktivnih Terminala</h3>
        <div className="space-y-3">
          {devices.length === 0 ? (
            <p className="text-center text-gray-400 italic">Nema autoriziranih uređaja.</p>
          ) : (
            devices.map(dev => (
              <div key={dev.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div>
                  <p className="font-black text-gray-800 text-lg uppercase leading-none mb-1">{dev.deviceName}</p>
                  <p className="font-mono text-[10px] text-gray-400">{dev.allowedDeviceUuid}</p>
                </div>
                <button
                  onClick={() => deleteDevice(dev.id)}
                  className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="Ukloni pristup"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;