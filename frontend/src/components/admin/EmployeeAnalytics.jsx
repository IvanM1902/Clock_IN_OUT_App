import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_ATTENDANCE = "http://192.168.0.53:8080/api/attendance";
const API_EMPLOYEES = "http://192.168.0.53:8080/api/employees";

function EmployeeAnalytics() {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [chartData, setChartData] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);

  useEffect(() => {
    fetch(`${API_ATTENDANCE}/status`).then(res => res.json()).then(setLogs);
    fetch(API_EMPLOYEES).then(res => res.json()).then(setEmployees);
  }, []);

  useEffect(() => {
    if (!selectedEmpId) return;

    const empLogs = logs
      .filter(l => l.employee.id.toString() === selectedEmpId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const dailyStats = {};
    const monthlyStats = {};

    for (let i = 0; i < empLogs.length; i++) {
      const current = empLogs[i];
      const dateObj = new Date(current.timestamp);
      const dateKey = dateObj.toLocaleDateString('hr-HR');
      const monthKey = dateObj.toLocaleString('hr-HR', { month: 'long', year: 'numeric' });

      if (current.type === 'IN' && empLogs[i + 1] && empLogs[i + 1].type === 'OUT') {
        const hours = (new Date(empLogs[i + 1].timestamp) - dateObj) / 3600000;
        dailyStats[dateKey] = { sati: (dailyStats[dateKey]?.sati || 0) + hours, originalDate: dateObj };
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + hours;
        i++;
      }
    }

    setMonthlyTotals(Object.keys(monthlyStats).map(m => ({ mjesec: m, ukupno: monthlyStats[m].toFixed(2) })));

    let chartEntries = Object.keys(dailyStats).map(date => ({
      datum: date,
      sati: parseFloat(dailyStats[date].sati.toFixed(2)),
      month: dailyStats[date].originalDate.toLocaleString('hr-HR', { month: 'long', year: 'numeric' }),
      originalDate: dailyStats[date].originalDate
    }));

    if (selectedMonth !== 'all') chartEntries = chartEntries.filter(e => e.month === selectedMonth);
    setChartData(chartEntries.sort((a, b) => a.originalDate - b.originalDate));
  }, [selectedEmpId, selectedMonth, logs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
        <h2 className="text-3xl font-black mb-6 italic text-gray-700">Analiza rada</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <select className="p-4 border-2 rounded-2xl font-bold bg-gray-50" value={selectedEmpId} onChange={(e) => { setSelectedEmpId(e.target.value); setSelectedMonth('all'); }}>
            <option value="">Izaberi radnika...</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.surname}</option>)}
          </select>
          <select className="p-4 border-2 rounded-2xl font-bold bg-gray-50" value={selectedMonth} disabled={!selectedEmpId} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="all">Svi mjeseci</option>
            {monthlyTotals.map(m => <option key={m.mjesec} value={m.mjesec}>{m.mjesec}</option>)}
          </select>
        </div>

        {selectedEmpId && chartData.length > 0 ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="datum" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="sati" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="text-center text-gray-400 italic py-10 font-bold">Nema podataka za prikaz.</p>}
      </div>

      {selectedEmpId && monthlyTotals.length > 0 && (
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black mb-4 text-gray-700 uppercase">Ukupno po mjesecima</h3>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
              <tr><th className="p-4">Mjesec</th><th className="p-4 text-right">Ukupno sati</th></tr>
            </thead>
            <tbody className="text-sm font-bold">
              {monthlyTotals.map((m, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50"><td className="p-4 capitalize">{m.mjesec}</td><td className="p-4 text-right text-blue-600 font-black">{m.ukupno} h</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeAnalytics;