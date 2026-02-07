import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function EmployeeAnalytics() {
  const [employees, setEmployees] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState({});
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('full');
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/employees`).then(res => res.json()).then(setEmployees);
    fetch(`${API_BASE}/attendance/available-periods`)
      .then(res => res.json())
      .then(data => {
        setAvailablePeriods(data);
        const years = Object.keys(data);
        if (years.length > 0) {
          const maxYear = Math.max(...years.map(Number));
          setSelectedYear(maxYear);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedEmpId) fetchData();
  }, [selectedEmpId, selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedMonth === 'full') {
        const monthsToFetch = availablePeriods[selectedYear] || [];
        const results = await Promise.all(
          monthsToFetch.map(m =>
            fetch(`${API_BASE}/attendance/report/${selectedEmpId}?year=${selectedYear}&month=${m}`).then(r => r.json())
          )
        );
        setReportData(Object.assign({}, ...results));
      } else {
        const res = await fetch(`${API_BASE}/attendance/report/${selectedEmpId}?year=${selectedYear}&month=${selectedMonth}`);
        setReportData(await res.json());
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const formatTimeFull = (totalMinutes) => {
    if (!totalMinutes) return "0h:00min";
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h}h:${String(m).padStart(2, '0')}min`;
  };

  const selectedEmployeeObj = employees.find(e => e.id.toString() === selectedEmpId);
  const mjeseciImena = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"];
  const mjeseciKratko = ["Sij", "Velj", "Ožu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"];

  const totals = Object.values(reportData).reduce((acc, curr) => {
    if (curr.status === 'GO') acc.go++;
    else if (curr.status === 'BO') acc.bo++;
    else if (curr.status === 'SLOBODAN') acc.off++;
    else acc.mins += (curr.totalMinutes || 0);
    return acc;
  }, { go: 0, bo: 0, off: 0, mins: 0 });

  let chartData = [];
  if (selectedMonth === 'full') {
    const monthlyStats = Array(12).fill(0).map((_, i) => ({ label: mjeseciKratko[i], sati: 0 }));
    Object.entries(reportData).forEach(([date, val]) => {
      const d = new Date(date);
      if (d.getFullYear() === selectedYear && val.status === 'WORK') {
        monthlyStats[d.getMonth()].sati += (val.totalMinutes || 0) / 60;
      }
    });
    chartData = monthlyStats.map(m => ({ ...m, sati: parseFloat(m.sati.toFixed(1)) }));
  } else {
    chartData = Object.entries(reportData)
      .map(([date, val]) => ({
        label: date.split('-')[2] + '.',
        sati: val.status === 'WORK' ? parseFloat(((val.totalMinutes || 0) / 60).toFixed(1)) : 0
      }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const title = selectedMonth === 'full' ? `Godišnji izvještaj - ${selectedYear}` : `Izvještaj: ${mjeseciImena[selectedMonth-1]} ${selectedYear}`;
    const tableRows = Object.entries(reportData).sort((a, b) => new Date(a[0]) - new Date(b[0])).map(([date, val]) => {
      const formattedDate = new Date(date).toLocaleDateString('hr-HR');
      let timeRange = '-';
      if (val.status === 'WORK' && val.logs) {
        const inLog = val.logs.find(l => l.type === 'IN');
        const outLog = [...val.logs].reverse().find(l => l.type === 'OUT');
        if (inLog && outLog) {
          const tIn = new Date(inLog.timestamp).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
          const tOut = new Date(outLog.timestamp).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
          timeRange = `${tIn} - ${tOut}`;
        }
      }
      return `<tr><td>${formattedDate}</td><td>${val.status}</td><td>${timeRange}</td><td>${val.status === 'WORK' ? formatTimeFull(val.totalMinutes) : '-'}</td></tr>`;
    }).join('');

    printWindow.document.write(`<html><head><style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f4f4f4;}</style></head><body><h1>${selectedEmployeeObj.name} ${selectedEmployeeObj.surname} - ${title}</h1><table><thead><tr><th>Datum</th><th>Status</th><th>Od-Do</th><th>Sati</th></tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=()=>{window.print();window.close();}</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-[40px] shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase">📊 Analitika</h2>
          <button onClick={handlePrint} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold tracking-widest hover:bg-blue-600 transition-all">PDF IZVJEŠTAJ</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold" value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)}>
            <option value="">Odaberi radnika...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} {emp.surname}</option>)}
          </select>
          <select className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {Object.keys(availablePeriods).map(y => <option key={y} value={y}>{y}. godina</option>)}
          </select>
          <select className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="full">Cijela godina</option>
            {(availablePeriods[selectedYear] || []).map(m => <option key={m} value={m}>{mjeseciImena[m-1]}</option>)}
          </select>
        </div>

        {selectedEmpId && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-600 p-5 rounded-[30px] shadow-lg shadow-blue-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-100 uppercase">Sati Rada</span>
                <span className="text-xl font-black text-white">{formatTimeFull(totals.mins)}</span>
              </div>
              <div className="bg-green-50 p-5 rounded-[30px] border border-green-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-green-400 uppercase">Godišnji</span>
                <span className="text-xl font-black text-green-600">{totals.go} d</span>
              </div>
              <div className="bg-red-50 p-5 rounded-[30px] border border-red-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-red-400 uppercase">Bolovanje</span>
                <span className="text-xl font-black text-red-600">{totals.bo} d</span>
              </div>
              <div className="bg-orange-50 p-5 rounded-[30px] border border-orange-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-orange-400 uppercase">Slobodan</span>
                <span className="text-xl font-black text-orange-600">{totals.off} d</span>
              </div>
            </div>

            <div className="h-[350px] bg-gray-50 rounded-[35px] p-6 border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="sati" fill="#2563eb" radius={[6, 6, 6, 6]} barSize={selectedMonth === 'full' ? 30 : 15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmployeeAnalytics;