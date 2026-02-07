import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const MonthlyPlanner = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportData, setReportData] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModal, setEditModal] = useState({ open: false, date: '', inTime: '', outTime: '' });

  useEffect(() => {
    fetch(`${API_BASE}/employees`).then(res => res.json()).then(setEmployees);
  }, []);

  useEffect(() => {
    if (selectedEmp) fetchReport();
    setSelectedDays([]);
  }, [selectedEmp, currentDate]);

  const fetchReport = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const res = await fetch(`${API_BASE}/attendance/report/${selectedEmp}?year=${year}&month=${month}`);
    const data = await res.json();
    setReportData(data);
    setLoading(false);
  };

  const formatTime = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return "";
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h}h:${String(m).padStart(2, '0')}min`;
  };

  // Statistika
  const stats = Object.values(reportData).reduce((acc, curr) => {
    if (curr.status === 'GO') acc.go++;
    else if (curr.status === 'BO') acc.bo++;
    else if (curr.status === 'SLOBODAN') acc.off++;
    else acc.mins += (curr.totalMinutes || 0);
    return acc;
  }, { go: 0, bo: 0, off: 0, mins: 0 });

  // Funkcija koja dohvaća točna vremena za modal
  const openEditModal = async (day) => {
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Defaulti ako nema ničega
    let inT = "08:00";
    let outT = "16:00";

    // Možemo dodati poseban API poziv da dobijemo točne zapise za taj dan
    try {
      const res = await fetch(`${API_BASE}/attendance/logs?employeeId=${selectedEmp}&date=${dateKey}`);
      const logs = await res.json(); // Očekujemo listu IN/OUT zapisa

      const inLog = logs.find(l => l.type === 'IN');
      const outLog = logs.find(l => l.type === 'OUT');

      if(inLog) inT = new Date(inLog.timestamp).toLocaleTimeString('hr-HR', {hour:'2-digit', minute:'2-digit'});
      if(outLog) outT = new Date(outLog.timestamp).toLocaleTimeString('hr-HR', {hour:'2-digit', minute:'2-digit'});
    } catch(e) { console.log("Koristim default vremena"); }

    setEditModal({ open: true, date: dateKey, inTime: inT, outTime: outT });
  };

  const saveManualTimes = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/attendance/manual-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: selectedEmp,
        date: editModal.date,
        inTime: editModal.inTime,
        outTime: editModal.outTime
      })
    });
    setEditModal({ ...editModal, open: false });
    fetchReport();
  };

  const toggleDaySelection = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (d.getDay() === 0) return;
    setSelectedDays(prev => prev.includes(day) ? prev.filter(i => i !== day) : [...prev, day]);
  };

  const setStatus = async (type) => {
    setLoading(true);
    for (const day of selectedDays) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      await fetch(`${API_BASE}/attendance/manual?employeeId=${selectedEmp}&date=${dateKey}&type=${type}`, { method: 'POST' });
    }
    setSelectedDays([]);
    fetchReport();
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const emptySlots = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
      {editModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border-4 border-blue-600 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter text-gray-800">Uredi sate rada</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-blue-500">Vrijeme prijave</label>
                <input type="time" className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-lg text-blue-800" value={editModal.inTime} onChange={(e) => setEditModal({...editModal, inTime: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-red-500">Vrijeme odjave</label>
                <input type="time" className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-2xl font-black text-lg text-red-800" value={editModal.outTime} onChange={(e) => setEditModal({...editModal, outTime: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveManualTimes} className="flex-1 bg-gray-900 text-white p-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">Spremi promjene</button>
              <button onClick={() => setEditModal({...editModal, open: false})} className="flex-1 bg-gray-100 text-gray-500 p-4 rounded-2xl font-black uppercase text-xs hover:bg-gray-200">Zatvori</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 bg-white rounded-[50px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter italic">📅 Planer</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <select className="flex-1 md:flex-none p-4 bg-gray-100 border-none rounded-2xl font-black text-sm outline-none appearance-none px-8 min-w-[200px]" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="">Odaberi radnika</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} {emp.surname}</option>)}
            </select>
            <input type="month" className="flex-1 md:flex-none p-4 bg-gray-100 border-none rounded-2xl font-black text-sm outline-none px-8" value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`} onChange={(e) => setCurrentDate(new Date(e.target.value))} />
          </div>
        </div>

        {selectedEmp && (
          <>
            <div className="flex gap-3 mb-8">
              <button onClick={() => setStatus('GO')} className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all">Godišnji</button>
              <button onClick={() => setStatus('BO')} className="bg-red-100 text-red-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Bolovanje</button>
              <button onClick={() => setStatus('SLOBODAN')} className="bg-orange-100 text-orange-700 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-500 hover:text-white transition-all">Slobodan</button>
              <button onClick={() => setStatus('DELETE')} className="ml-auto bg-gray-100 text-gray-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all italic">Obriši</button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(d => (
                <div key={d} className="text-center text-[11px] font-black text-gray-300 uppercase mb-2 tracking-widest">{d}</div>
              ))}
              {[...Array(emptySlots)].map((_, i) => <div key={i}></div>)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const isSun = dateObj.getDay() === 0;
                const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const data = reportData[key];
                const isSelected = selectedDays.includes(day);

                // Boje za status (VRAĆENO)
                let bgColor = "bg-gray-50 text-gray-400";
                if (data?.status === 'WORK') bgColor = "bg-blue-600 text-white shadow-lg shadow-blue-100";
                if (data?.status === 'GO') bgColor = "bg-green-500 text-white";
                if (data?.status === 'BO') bgColor = "bg-red-500 text-white";
                if (data?.status === 'SLOBODAN') bgColor = "bg-orange-500 text-white";
                if (isSun) bgColor = "bg-gray-200 text-gray-400 opacity-30";

                return (
                  <div key={day} onClick={() => !isSun && toggleDaySelection(day)} onDoubleClick={() => !isSun && openEditModal(day)}
                    className={`aspect-square rounded-[22px] p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden
                      ${bgColor} ${isSelected ? 'ring-4 ring-gray-900 ring-offset-2' : ''}`}>
                    <span className={`text-[11px] font-black ${data?.status ? 'opacity-50' : ''}`}>{day}.</span>
                    <span className="text-[10px] font-black text-center leading-tight uppercase">
                      {data?.status === 'WORK' ? formatTime(data.totalMinutes) : data?.status}
                    </span>
                    {data?.status === 'WORK' && <span className="absolute top-1 right-2 text-[8px] opacity-40">✎</span>}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t-2 border-gray-50 pt-10">
              <div className="p-6 rounded-[35px] bg-blue-50 border border-blue-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Ukupni Sati</span>
                <span className="text-xl font-black text-blue-600">{formatTime(stats.mins) || "0h:00min"}</span>
              </div>
              <div className="p-6 rounded-[35px] bg-green-50 border border-green-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Godišnji</span>
                <span className="text-xl font-black text-green-600">{stats.go} d</span>
              </div>
              <div className="p-6 rounded-[35px] bg-red-50 border border-red-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Bolovanje</span>
                <span className="text-xl font-black text-red-600">{stats.bo} d</span>
              </div>
              <div className="p-6 rounded-[35px] bg-orange-50 border border-orange-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Slobodan</span>
                <span className="text-xl font-black text-orange-600">{stats.off} d</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyPlanner;