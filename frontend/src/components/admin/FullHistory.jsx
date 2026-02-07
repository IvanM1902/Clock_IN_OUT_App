import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_EMPLOYEES = `${API_BASE}/employees`;
const API_ATTENDANCE = `${API_BASE}/attendance`;

function FullHistory() {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingLog, setEditingLog] = useState(null);

  // Filteri
  const [filterEmp, setFilterEmp] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;

  const fetchData = () => {
    fetch(`${API_ATTENDANCE}/status`)
      .then(res => res.json())
      .then(data => setHistory(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))));

    fetch(API_EMPLOYEES)
      .then(res => res.json())
      .then(setEmployees);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteSingleLog = async (id) => {
    if (window.confirm("Sigurno želiš obrisati ovaj zapis?")) {
      await fetch(`${API_ATTENDANCE}/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_ATTENDANCE}/${editingLog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: editingLog.type,
        timestamp: editingLog.timestamp
      })
    });
    if (res.ok) {
      setEditingLog(null);
      fetchData();
    }
  };

  const clearHistory = async () => {
    if (window.confirm("PAŽNJA: Želite li trajno obrisati CIJELU povijest?")) {
      await fetch(`${API_ATTENDANCE}/clear`, { method: 'DELETE' });
      fetchData();
    }
  };

  // Filtriranje
  const filteredHistory = history.filter(log => {
    const matchEmp = filterEmp === '' || log.employee.id.toString() === filterEmp;
    const logDate = log.timestamp.split('T')[0];
    const matchStart = startDate === '' || logDate >= startDate;
    const matchEnd = endDate === '' || logDate <= endDate;
    return matchEmp && matchStart && matchEnd;
  });

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-black text-gray-700 uppercase italic tracking-tighter">Povijest Zapisa</h2>
        <button
          onClick={clearHistory}
          className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all border border-red-100"
        >
          Obriši Sve
        </button>
      </div>

      {/* FILTERI */}
      <div className="bg-white p-6 rounded-[30px] shadow-sm mb-6 border border-gray-100 flex flex-wrap gap-4">
        <select
          className="flex-1 min-w-[200px] p-3 bg-gray-50 border-none rounded-xl font-bold text-gray-600"
          value={filterEmp}
          onChange={(e) => { setFilterEmp(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Svi radnici</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.surname}</option>)}
        </select>
        <input
          type="date"
          className="p-3 bg-gray-50 border-none rounded-xl font-bold text-gray-600"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
        />
        <input
          type="date"
          className="p-3 bg-gray-50 border-none rounded-xl font-bold text-gray-600"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* TABLICA */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
              <th className="p-6">Radnik</th>
              <th className="p-6">Tip</th>
              <th className="p-6">Datum i Vrijeme</th>
              <th className="p-6 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentRecords.map((log) => (
              <tr key={log.id} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors group">
                <td className="p-6 font-black text-gray-800">{log.employee.name} {log.employee.surname}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${log.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.type}
                  </span>
                </td>
                <td className="p-6 font-bold text-gray-500">
                  {new Date(log.timestamp).toLocaleString('hr-HR')}
                </td>
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() => setEditingLog(log)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteSingleLog(log.id)}
                    className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentRecords.length === 0 && (
          <div className="p-20 text-center text-gray-300 font-bold italic">Nema zapisa za odabrane filtere.</div>
        )}
      </div>

      {/* PAGINACIJA */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${currentPage === 1 ? 'opacity-30' : 'bg-white shadow-sm border'}`}
          >
            Prethodna
          </button>
          <span className="text-xs font-black text-gray-400">Strana {currentPage} od {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${currentPage === totalPages ? 'opacity-30' : 'bg-white shadow-sm border'}`}
          >
            Sljedeća
          </button>
        </div>
      )}

      {/* MODAL ZA UREĐIVANJE */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-black mb-6 uppercase italic text-gray-700">Uredi Zapis</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Tip prijave</label>
                <select
                  value={editingLog.type}
                  onChange={e => setEditingLog({...editingLog, type: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all"
                >
                  <option value="IN">Ulaz (IN)</option>
                  <option value="OUT">Izlaz (OUT)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Vrijeme</label>
                <input
                  type="datetime-local"
                  value={editingLog.timestamp.substring(0, 16)}
                  onChange={e => setEditingLog({...editingLog, timestamp: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingLog(null)} className="flex-1 font-bold text-gray-400 hover:text-gray-600 transition-colors">Odustani</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">SPREMI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FullHistory;