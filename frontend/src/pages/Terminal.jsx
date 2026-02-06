import { useState, useEffect } from 'react'

function Terminal() {
  const [pin, setPin] = useState('')
  const [message, setMessage] = useState('Unesite PIN')
  const [isLocationValid, setIsLocationValid] = useState(true); // Pretpostavljamo da je OK dok ne provjerimo
  const [loading, setLoading] = useState(true);

  const API_ATTENDANCE = "http://192.168.0.53:8080/api/attendance";
  const API_SETTINGS = "http://192.168.0.53:8080/api/settings";

  // Provjera lokacije pri svakom učitavanju aplikacije
  useEffect(() => {
    fetch(`${API_SETTINGS}/check-location`)
      .then(res => res.json())
      .then(data => {
        // Koristimo "isAllowed" jer je tako definirano u vašem AppSettingsControlleru
        setIsLocationValid(data.isAllowed);
        setLoading(false);
      })
      .catch(() => {
        setIsLocationValid(false);
        setLoading(false);
      });
  }, []);

  const handlePunch = () => {
    if (pin.length !== 4) {
      setMessage("PIN mora imati 4 broja");
      setTimeout(() => setMessage('Unesite PIN'), 2000);
      return;
    }

    fetch(`${API_ATTENDANCE}/punch?pin=${pin}`, { method: 'POST' })
      .then(res => {
        if (res.status === 403) throw new Error("PRISTUP ODBIJEN: Niste u salonu!");
        return res.text();
      })
      .then(msg => {
        setMessage(msg);
        setPin('');
        setTimeout(() => setMessage('Unesite PIN'), 3000);
      })
      .catch((err) => {
        setMessage(err.message || "Greška na serveru");
        setPin('');
        setTimeout(() => setMessage('Unesite PIN'), 3000);
      });
  };

  // 1. Prikaz učitavanja dok provjeravamo IP
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-black text-gray-400 uppercase tracking-widest">
        Provjera lokacije...
      </div>
    );
  }

  // 2. Ako lokacija nije dozvoljena, prikaži "Lock Screen"
  if (!isLocationValid) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-10 text-center text-white">
        <div className="max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Terminal Blokiran</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Pristup terminalu dozvoljen je isključivo s WiFi mreže salona.
            Molimo spojite se na ispravnu mrežu ili kontaktirajte administratora.
          </p>
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Vaš IP nije na popisu dozvoljenih adresa
          </div>
        </div>
      </div>
    );
  }

  // 3. Glavni Terminal UI (prikazuje se samo ako je lokacija ispravna)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2">
      <div className="bg-white p-5 rounded-[30px] shadow-2xl w-full max-w-[340px] text-center border-t-8 border-blue-600">

        <div className="h-14 flex items-center justify-center mb-2">
          <h1 className="text-lg font-black text-gray-800 uppercase leading-tight px-2">
            {message}
          </h1>
        </div>

        <div className="bg-gray-100 text-4xl p-4 rounded-2xl mb-4 h-16 flex items-center justify-center tracking-[0.4em] font-mono text-blue-600 shadow-inner">
          {pin.replace(/./g, '•') || <span className="text-gray-300">____</span>}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => pin.length < 4 && setPin(p => p + num)} className="bg-gray-50 h-14 rounded-xl text-2xl font-black active:scale-95 border border-gray-100">
              {num}
            </button>
          ))}
          <button onClick={() => setPin('')} className="bg-red-50 text-red-500 h-14 rounded-xl text-xs font-black active:scale-95 border border-red-100">CLEAR</button>
          <button onClick={() => pin.length < 4 && setPin(p => p + '0')} className="bg-gray-50 h-14 rounded-xl text-2xl font-black active:scale-95 border border-gray-100">0</button>
          <button onClick={handlePunch} className="bg-blue-600 text-white h-14 rounded-xl text-xs font-black active:scale-95 shadow-lg shadow-blue-200">ENTER</button>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sustav Evidencije v2.0</p>
    </div>
  );
}

export default Terminal;