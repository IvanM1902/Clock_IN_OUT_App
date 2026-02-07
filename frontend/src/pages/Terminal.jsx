import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Terminal() {
  const [pin, setPin] = useState('')
  const [message, setMessage] = useState('Unesite PIN')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [myUuid, setMyUuid] = useState('')

  useEffect(() => {
    // Samo dohvaćamo postojeći UUID koji je postavio App.jsx
    const uuid = localStorage.getItem('terminal_uuid');
    setMyUuid(uuid);

    if (uuid) {
      fetch(`${API_BASE}/api/settings/check-device?uuid=${uuid}`)
        .then(res => res.json())
        .then(data => {
          setIsAuthorized(data.isAllowed);
          setLoading(false);
        })
        .catch(() => {
          setIsAuthorized(false);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handlePunch = () => {
    if (pin.length !== 4) {
      setMessage("PIN mora imati 4 broja");
      setTimeout(() => setMessage('Unesite PIN'), 2000);
      return;
    }
    fetch(`${API_BASE}/api/attendance/punch?pin=${pin}`, { method: 'POST' })
      .then(res => res.text())
      .then(msg => {
        setMessage(msg);
        setPin('');
        setTimeout(() => setMessage('Unesite PIN'), 3000);
      })
      .catch(() => {
        setMessage("Greška na serveru");
        setPin('');
        setTimeout(() => setMessage('Unesite PIN'), 3000);
      });
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-black uppercase tracking-widest">
      Učitavanje...
    </div>
  );

  if (!isAuthorized) return (
    <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-white text-3xl font-black mb-4 uppercase">Uređaj nije autoriziran</h1>
      <p className="text-red-200 font-bold mb-6">UUID: <span className="font-mono bg-black/30 p-2 rounded">{myUuid}</span></p>
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm">
        <p className="text-gray-800 font-bold">Molimo obratite se administratoru kako biste dodali ovaj uređaj u sustav.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2">
      <div className="bg-white p-5 rounded-[30px] shadow-2xl w-full max-w-[340px] text-center border-t-8 border-blue-600">
        <div className="h-14 flex items-center justify-center mb-2">
          <h1 className="text-lg font-black text-gray-800 uppercase leading-tight px-2">{message}</h1>
        </div>

        <div className="bg-gray-100 text-4xl p-4 rounded-2xl mb-4 h-16 flex items-center justify-center tracking-[0.4em] font-mono text-blue-600 shadow-inner">
          {pin.replace(/./g, '•') || <span className="text-gray-300">____</span>}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => pin.length < 4 && setPin(p => p + num)} className="bg-gray-50 h-14 rounded-xl text-2xl font-black active:scale-95 border border-gray-100">{num}</button>
          ))}
          <button onClick={() => setPin('')} className="bg-red-50 text-red-500 h-14 rounded-xl text-xs font-black active:scale-95 uppercase">Briši</button>
          <button onClick={() => pin.length < 4 && setPin(p => p + '0')} className="bg-gray-50 h-14 rounded-xl text-2xl font-black active:scale-95 border border-gray-100">0</button>
          <button onClick={handlePunch} className="bg-blue-600 text-white h-14 rounded-xl text-xs font-black active:scale-95 shadow-lg shadow-blue-200 uppercase">Potvrda</button>
        </div>

        <p className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Terminal ID: {myUuid}</p>
      </div>
    </div>
  )
}

export default Terminal;