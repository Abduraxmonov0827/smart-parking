import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ParkingSquare, Car, Radio, ArrowRight, Cpu, Shield, BarChart3 } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { reportApi } from '../api';

export default function Home() {
  const fetchStats = useCallback(() => reportApi.getDashboard(), []);
  const { data: stats, loading } = usePolling(fetchStats, 10000);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white p-8 lg:p-12">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
            <Radio className="w-4 h-4" /> Final Year Project — Arduino Simulation
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            Automated Smart Parking System
          </h1>
          <p className="mt-4 text-blue-100 text-lg leading-relaxed">
            Designing and Developing a Model of an Automated Smart Parking System Based on an
            Arduino Microcontroller — with simulated HC-SR04 ultrasonic sensors for real-time
            slot monitoring, entry/exit management, and analytics.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/slots" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 font-semibold rounded-lg hover:bg-white/20">
              View Slots
            </Link>
          </div>
        </div>
      </section>

      {loading ? <LoadingSpinner /> : stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Slots" value={stats.totalSlots} icon={<ParkingSquare className="w-5 h-5" />} />
          <StatCard title="Occupied" value={stats.occupiedSlots} icon={<Car className="w-5 h-5" />} color="red" subtitle={`${stats.occupancyRate}% occupancy`} />
          <StatCard title="Available" value={stats.availableSlots} icon={<LayoutDashboard className="w-5 h-5" />} color="green" />
          <StatCard title="Active Sessions" value={stats.activeSessions} icon={<Radio className="w-5 h-5" />} color="purple" />
        </div>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Cpu, title: 'Arduino Simulation', desc: 'HC-SR04 ultrasonic sensors simulate distance readings every 15 seconds to detect vehicle presence.' },
          { icon: Car, title: 'Vehicle Management', desc: 'Register vehicles, track parking history, and manage automated check-in/check-out with fee calculation.' },
          { icon: BarChart3, title: 'Analytics & Reports', desc: 'Daily, weekly, and monthly reports with occupancy trends, revenue tracking, and CSV/PDF export.' },
          { icon: Shield, title: 'Admin Panel', desc: 'JWT-secured role-based access control with user management and system activity logging.' },
          { icon: ParkingSquare, title: 'Slot Monitoring', desc: 'Real-time visual grid showing available (green) and occupied (red) parking spaces by zone and floor.' },
          { icon: Radio, title: 'Sensor Logs', desc: 'All sensor events are logged with timestamps for monitoring and debugging the Arduino simulation.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
