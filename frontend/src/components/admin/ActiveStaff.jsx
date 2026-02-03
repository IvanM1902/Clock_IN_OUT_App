import { useState, useEffect } from 'react';

const API_EMPLOYEES = "http://192.168.0.53:8080/api/employees";
const API_ATTENDANCE = "http://192.168.0.53:8080/api/attendance";

function ActiveStaff() {
  const [employees, setEmployees] = useState([]);
  const [lastStatuses, setLastStatuses] = useState({});

  useEffect(() => {
    fetch(API_EMPLOYEES).then(res => res.json()).then(setEmployees);
    fetch(`${API_ATTENDANCE}/status`).then(res => res.json()).then(data => {
      const statuses = data.reduce((acc, curr) => {
        acc[curr.employee.id] = curr;
        return acc;
      }, {});
      setLastStatuses(statuses);
    });
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-black mb-6 italic text-gray-700 uppercase tracking-tighter">Status radnika</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => {
          const lastLog = lastStatuses[emp.id];
          const isActive = lastLog?.type === 'IN';

          return (
            <div key={emp.id} className={`bg-white border-l-8 p-6 rounded-2xl shadow-sm transition-all ${isActive ? 'border-green-500 bg-green-50/20' : 'border-red-500 opacity-80'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-xl text-gray-800">{emp.name} {emp.surname}</p>
                  <p className="text-[10px] text-blue-500 font-black uppercase mb-3 tracking-widest">{emp.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isActive ? '● Prisutan' : '○ Odsutan'}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                {lastLog ? (
                  <p className="text-xs text-gray-500 italic">
                    {isActive ? 'Ušao: ' : 'Izašao: '}
                    <span className="font-bold text-gray-700">{new Date(lastLog.timestamp).toLocaleString('hr-HR')}</span>
                  </p>
                ) : <p className="text-xs text-gray-400 italic font-medium">Nema zabilježenih aktivnosti</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActiveStaff;