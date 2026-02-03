import { useState, useEffect } from 'react'

function Terminal() {
  const [pin, setPin] = useState('')
  const [message, setMessage] = useState('Unesite PIN')
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const API_TERMINALS = "http://192.168.0.53:8080/api/terminals";
  const API_ATTENDANCE = "http://192.168.0.53:8080/api/attendance";

  useEffect(() => {
    const key = localStorage.getItem('terminal_device_key');
    if (key) {
      fetch(`${API_TERMINALS}/check/${key}`)
        .then(res => res.json())
        .then(hasAccess => setIsAuthorized(hasAccess))
        .catch(() => setIsAuthorized(false));
    }
  }, []);

  const handlePunch = () => {
    if (pin.length !== 4) {
      setMessage("PIN mora imati 4 broja");
      setTimeout(() => setMessage('Unesite PIN'), 2000);
      return;
    }

    fetch(`${API_ATTENDANCE}/punch?pin=${pin}`, { method: 'POST' })
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
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full" onClick={() => setTapCount(prev => prev + 1)}>
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-black mb-2 uppercase">Uređaj nije autoriziran</h2>
          {tapCount >= 5 && (
            <button onClick={() => {
              const code = prompt("Kod:");
              if(code === "SALON-2024") setIsAuthorized(true);
            }} className="bg-blue-600 text-white w-full py-4 rounded-2xl font-black mt-4">Autoriziraj</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2">
      <div className="bg-white p-5 rounded-[30px] shadow-2xl w-full max-w-[340px] text-center border-t-8 border-blue-600">

        {/* Fiksirana visina za poruku */}
        <div className="h-14 flex items-center justify-center mb-2">
          <h1 className="text-lg font-black text-gray-800 uppercase leading-tight px-2">
            {message}
          </h1>
        </div>

        {/* Display za PIN */}
        <div className="bg-gray-100 text-4xl p-4 rounded-2xl mb-4 h-16 flex items-center justify-center tracking-[0.4em] font-mono text-blue-600 shadow-inner">
          {pin.replace(/./g, '•') || <span className="text-gray-300">____</span>}
        </div>

        {/* Tipkovnica */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => pin.length < 4 && setPin(p => p + num)}
              className="bg-gray-50 h-14 rounded-xl text-2xl font-black active:scale-95 border border-gray-100"
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPin('')}
            className="bg-red-50 text-red-500 h-14 rounded-xl text-xs font-black active:scale-95 border border-red-100"
          >
            CLEAR
          </button>

          <button
            onClick={() => pin.length < 4 && setPin(p => p + '0')}
            className="bg-gray-50 h-14 rounded-xl text-2xl font-black active:scale-95 border border-gray-100"
          >
            0
          </button>

          <button
            onClick={handlePunch}
            className="bg-blue-600 text-white h-14 rounded-xl text-xs font-black active:scale-95 shadow-lg shadow-blue-200"
          >
            ENTER
          </button>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sustav Evidencije v1.1</p>
    </div>
  );
}

export default Terminal;