import { useCallback } from 'react';
import { ParkingSquare, Car, DollarSign, Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner, { PageError } from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { reportApi } from '../api';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#94a3b8'];

export default function Dashboard() {
  const fetchStats = useCallback(() => reportApi.getDashboard(), []);
  const fetchHourly = useCallback(() => reportApi.getHourlyEntries(), []);
  const fetchActivity = useCallback(() => reportApi.getRecentActivity(), []);
  const fetchZones = useCallback(() => reportApi.getZoneOccupancy(), []);

  const { data: stats, loading, error, refresh } = usePolling(fetchStats, 5000);
  const { data: hourly } = usePolling(fetchHourly, 10000);
  const { data: activity } = usePolling(fetchActivity, 5000);
  const { data: zones } = usePolling(fetchZones, 10000);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error || !stats) return <PageError message={error || 'Failed to load'} onRetry={refresh} />;

  const pieData = [
    { name: 'Available', value: stats.availableSlots },
    { name: 'Occupied', value: stats.occupiedSlots },
    { name: 'Reserved', value: stats.reservedSlots },
    { name: 'Maintenance', value: stats.maintenanceSlots },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Slots" value={stats.totalSlots} icon={<ParkingSquare className="w-5 h-5" />} />
        <StatCard title="Occupied" value={stats.occupiedSlots} icon={<Car className="w-5 h-5" />} color="red" subtitle={`${stats.occupancyRate}% rate`} />
        <StatCard title="Available" value={stats.availableSlots} icon={<Activity className="w-5 h-5" />} color="green" />
        <StatCard title="Today's Revenue" value={`$${stats.todayRevenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5" />} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold mb-4">Today's Entry Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourly?.map((h) => ({ hour: `${h.hour}:00`, entries: h.entries })) || []}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="entries" stroke="#3b82f6" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Slot Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-2"><ArrowDownLeft className="w-4 h-4" /><span className="text-sm font-medium">Today's Entries</span></div>
          <p className="text-3xl font-bold">{stats.todayEntries}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-red-500 mb-2"><ArrowUpRight className="w-4 h-4" /><span className="text-sm font-medium">Today's Exits</span></div>
          <p className="text-3xl font-bold">{stats.todayExits}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-blue-600 mb-2"><Activity className="w-4 h-4" /><span className="text-sm font-medium">Occupancy Rate</span></div>
          <p className="text-3xl font-bold">{stats.occupancyRate}%</p>
        </div>
      </div>

      {zones && zones.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Zone Utilization</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {zones.map((z) => (
              <div key={z.zone} className="text-center">
                <p className="text-sm text-slate-500">Zone {z.zone}</p>
                <p className="text-2xl font-bold mt-1">{z.occupied}/{z.total}</p>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(z.occupied / z.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-200"><h3 className="font-semibold">Recent Activity</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                <th className="text-left px-5 py-3 font-medium">Slot</th>
                <th className="text-left px-5 py-3 font-medium">Entry</th>
                <th className="text-left px-5 py-3 font-medium">Exit</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activity?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono">{s.vehicle?.plateNumber}</td>
                  <td className="px-5 py-3">{s.slot?.slotNumber}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(s.entryTime).toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500">{s.exitTime ? new Date(s.exitTime).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3"><Badge status={s.status} /></td>
                  <td className="px-5 py-3 text-right font-medium">{s.fee > 0 ? `$${s.fee.toFixed(2)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
