import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Baby, Stethoscope, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      name: 'Total Orang Tua',
      stat: '127',
      icon: Users,
      change: '+12%',
      changeType: 'increase',
      color: 'blue'
    },
    {
      name: 'Total Bayi',
      stat: '89',
      icon: Baby,
      change: '+8%',
      changeType: 'increase',
      color: 'blue'
    },
    {
      name: 'Pemeriksaan Bulan Ini',
      stat: '234',
      icon: Stethoscope,
      change: '+23%',
      changeType: 'increase',
      color: 'blue'
    },
    {
      name: 'Tingkat Stunting',
      stat: '78%',
      icon: CheckCircle,
      change: '+5%',
      changeType: 'increase',
      color: 'blue'
    }
  ];

  const recentExaminations = [
    {
      id: 1,
      babyName: 'Andi Pratama',
      age: '14 bulan',
      status: 'Normal',
      statusColor: 'green',
      date: '2024-01-15',
      height: '78 cm',
      weight: '9.2 kg'
    },
    {
      id: 2,
      babyName: 'Sari Dewi',
      age: '18 bulan',
      status: 'Risiko Stunting',
      statusColor: 'yellow',
      date: '2024-01-15',
      height: '74 cm',
      weight: '8.1 kg'
    },
    {
      id: 3,
      babyName: 'Budi Santoso',
      age: '24 bulan',
      status: 'Stunting',
      statusColor: 'red',
      date: '2024-01-14',
      height: '79 cm',
      weight: '9.8 kg'
    },
    {
      id: 4,
      babyName: 'Maya Putri',
      age: '12 bulan',
      status: 'Normal',
      statusColor: 'green',
      date: '2024-01-14',
      height: '72 cm',
      weight: '8.5 kg'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: '3 bayi memerlukan pemeriksaan lanjutan',
      time: '2 jam yang lalu'
    },
    {
      id: 2,
      type: 'info',
      message: 'Laporan bulanan siap untuk diunduh',
      time: '1 hari yang lalu'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="px-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white pt-6 px-6 pb-6 rounded-2xl overflow-hidden hover:shadow-modern-lg transition-all hover:scale-[1.02] shadow-sm">
            <dt>
              <div className={`absolute bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl p-3 shadow-modern`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-semibold text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{item.stat}</p>
              <p className={`ml-3 flex items-baseline text-sm font-semibold ${
                item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Examinations */}
        <div className="lg:col-span-2">
          <div className="glass shadow-modern rounded-2xl border-0">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">
                Pemeriksaan Terbaru
              </h3>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="pr-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Nama Bayi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Umur
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {recentExaminations.map((exam) => (
                      <tr key={exam.id} className="hover:bg-white/80 transition-colors">
                        <td className="pr-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => navigate(`/babies/${exam.id}`)}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {exam.babyName}
                          </button>
                          <div className="text-sm text-gray-500 font-medium">{exam.height} • {exam.weight}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {exam.age}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            exam.statusColor === 'green' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                              : exam.statusColor === 'yellow'
                              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
                              : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                          }`}>
                            {exam.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {exam.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div className="glass shadow-modern rounded-2xl border-0">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">
                Notifikasi
              </h3>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-xl border-0 ${
                    alert.type === 'warning' 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 glass shadow-modern rounded-2xl border-0">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">
                Statistik Cepat
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Normal</span>
                  <span className="text-sm font-bold text-green-600">69 bayi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Risiko Stunting</span>
                  <span className="text-sm font-bold text-yellow-600">15 bayi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Stunting</span>
                  <span className="text-sm font-bold text-red-600">5 bayi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;