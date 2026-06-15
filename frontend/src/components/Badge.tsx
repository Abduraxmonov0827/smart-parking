import type { SlotStatus } from '../types';

const styles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  OCCUPIED: 'bg-red-100 text-red-700',
  RESERVED: 'bg-amber-100 text-amber-700',
  MAINTENANCE: 'bg-slate-200 text-slate-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  ADMIN: 'bg-purple-100 text-purple-700',
  OPERATOR: 'bg-blue-100 text-blue-700',
  USER: 'bg-slate-100 text-slate-600',
};

export default function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function SlotStatusColor(status: SlotStatus) {
  const map: Record<SlotStatus, string> = {
    AVAILABLE: 'border-emerald-300 bg-emerald-50',
    OCCUPIED: 'border-red-300 bg-red-50',
    RESERVED: 'border-amber-300 bg-amber-50',
    MAINTENANCE: 'border-slate-300 bg-slate-100',
  };
  return map[status];
}
