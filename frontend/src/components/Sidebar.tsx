import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, ParkingSquare, Car, ArrowLeftRight,
  BarChart3, Settings, Shield, LogOut, X, Menu, Radio,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const nav = [
  { to: '/', icon: Home, label: 'Home', public: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/slots', icon: ParkingSquare, label: 'Parking Slots' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/entry-exit', icon: ArrowLeftRight, label: 'Entry & Exit' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/admin', icon: Shield, label: 'Admin Panel', roles: ['ADMIN'] },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = nav.filter((item) => {
    if (item.roles && user && !item.roles.includes(user.role)) return false;
    return true;
  });

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200
        lg:translate-x-0 lg:static lg:min-h-screen ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold">P</div>
            <div>
              <p className="font-bold text-sm">Smart Parking</p>
              <p className="text-[10px] text-white/50">Arduino Simulation</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {filtered.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10'}`}>
              <Icon className="w-4 h-4" />{label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 p-4 border-t border-white/10 space-y-3 bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            HC-SR04 Simulator Active
          </div>
          {user && (
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-white/50">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg" title="Logout">
                <LogOut className="w-4 h-4 text-white/70" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
      <Menu className="w-5 h-5" />
    </button>
  );
}
