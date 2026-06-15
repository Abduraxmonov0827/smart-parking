import { useState, useCallback } from 'react';
import { Download, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { reportApi } from '../api';
import { exportToCSV, exportToPDF, buildTable } from '../utils/export';

export default function Reports() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const fetchWeekly = useCallback(() => reportApi.getWeekly(), []);
  const fetchDaily = useCallback(() => reportApi.getDaily(), []);
  const fetchMonthly = useCallback(() => reportApi.getMonthly(), []);
  const fetchTrend = useCallback(() => reportApi.getOccupancyTrend(7), []);
  const fetchVehicleStats = useCallback(() => reportApi.getVehicleStats(), []);
  const fetchZones = useCallback(() => reportApi.getZoneOccupancy(), []);

  const { data: weekly, loading } = usePolling(fetchWeekly, 30000);
  const { data: daily } = usePolling(fetchDaily, 30000);
  const { data: monthly } = usePolling(fetchMonthly, 30000);
  const { data: trend } = usePolling(fetchTrend, 30000);
  const { data: vehicleStats } = usePolling(fetchVehicleStats, 30000);
  const { data: zones } = usePolling(fetchZones, 30000);

  const chartData = period === 'weekly'
    ? (weekly || [])
    : period === 'daily' && daily
      ? [{ date: daily.date, entries: daily.entries, exits: daily.exits, revenue: daily.revenue }]
      : [];

  const handleExportCSV = () => {
    if (!weekly) return;
    exportToCSV(weekly, `parking-report-${period}`);
  };

  const handleExportPDF = () => {
    exportToPDF('Smart Parking Report', [
      { heading: `${period.charAt(0).toUpperCase() + period.slice(1)} Summary`, content: buildTable(weekly || []) },
      { heading: 'Vehicle Statistics', content: buildTable(vehicleStats?.byType || []) },
      { heading: 'Zone Occupancy', content: buildTable(zones || []) },
    ], `parking-report-${period}`);
  };

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={handleExportPDF} className="btn-secondary"><FileText className="w-4 h-4" /> Export PDF</button>
        </div>
      </div>

      {period === 'monthly' && monthly && (
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="card p-5"><p className="text-sm text-slate-500">Total Sessions</p><p className="text-2xl font-bold mt-1">{monthly.totalSessions}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Completed</p><p className="text-2xl font-bold mt-1">{monthly.completedSessions}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-bold mt-1">${monthly.totalRevenue.toFixed(2)}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Avg Fee</p><p className="text-2xl font-bold mt-1">${monthly.avgFee.toFixed(2)}</p></div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Entries & Exits</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="entries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Occupancy Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Occupancy']} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Vehicle Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vehicleStats?.byType?.map((t) => ({ type: t.vehicleType, count: t._count }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
