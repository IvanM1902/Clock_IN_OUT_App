import { useState, useEffect } from 'react';

const API_ATTENDANCE = "http://192.168.0.53:8080/api/attendance";
const API_EMPLOYEES = "http://192.168.0.53:8080/api/employees";

function FullHistory() {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filteri
  const [filterEmp, setFilterEmp] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // PAGINATION STATE
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

  const clearHistory = async () => {
    if (window.confirm("PAŽNJA: Želite li trajno obrisati CIJELU povijest?")) {
      await fetch(`${API_ATTENDANCE}/clear`, { method: 'DELETE' });
      fetchData();
    }
  };

  // 1. Prvo filtriramo podatke
  const filteredHistory = history.filter(h => {
    const logDate = new Date(h.timestamp).toISOString().split('T')[0];
    const matchesEmployee = filterEmp === '' || h.employee.id.toString() === filterEmp;
    const matchesStart = startDate === '' || logDate >= startDate;
    const matchesEnd = endDate === '' || logDate <= endDate;
    return matchesEmployee && matchesStart && matchesEnd;
  });

  // 2. Izračun za pagination na temelju filtriranih podataka
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredHistory.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);

  // Resetiraj na prvu stranicu ako se promijene filteri
  useEffect(() => {
    setCurrentPage(1);
  }, [filterEmp, startDate, endDate]);

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-black italic text-gray-700 uppercase tracking-tighter">Povijest aktivnosti</h2>
        <button
          onClick={clearHistory}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all border border-red-100"
        >
          OBRIŠI SVE
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Radnik</label>
          <select
            className="w-full p-3 border-2 rounded-xl font-bold bg-gray-50 text-sm"
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
          >
            <option value="">Svi radnici</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.surname}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Od datuma</label>
          <input type="date" className="w-full p-3 border-2 rounded-xl font-bold bg-gray-50 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Do datuma</label>
          <input type="date" className="w-full p-3 border-2 rounded-xl font-bold bg-gray-50 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <button onClick={() => { setFilterEmp(''); setStartDate(''); setEndDate(''); }} className="p-3 text-gray-400 font-bold text-sm hover:text-gray-800 transition-colors">
          Resetiraj filtere
        </button>
      </div>

      {/* TABLICA */}
      <div className="bg-white rounded-[30px] shadow-sm overflow-hidden border border-gray-100 mb-6">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-5">Radnik</th>
              <th className="p-5">Tip</th>
              <th className="p-5 text-right">Vrijeme i Datum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentRecords.map(h => (
              <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5">
                  <p className="font-black text-gray-800">{h.employee.name} {h.employee.surname}</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase">{h.employee.role}</p>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    h.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {h.type}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <p className="text-sm font-bold text-gray-600">
                    {new Date(h.timestamp).toLocaleString('hr-HR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHistory.length === 0 && (
          <div className="p-20 text-center text-gray-300 font-bold italic">Nema zapisa za odabrane filtere.</div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${
              currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 shadow-sm border border-gray-100'
            }`}
          >
            Prethodna
          </button>

          <span className="font-black text-gray-500 text-xs uppercase">
            Stranica {currentPage} od {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${
              currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 shadow-sm border border-gray-100'
            }`}
          >
            Sljedeća
          </button>
        </div>
      )}

      <p className="text-center text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest">
        Ukupno pronađeno: {filteredHistory.length} zapisa
      </p>
    </div>
  );
}

export default FullHistory;