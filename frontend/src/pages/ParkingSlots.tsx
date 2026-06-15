import { useState, useCallback } from 'react';
import { Search, Filter, Radio } from 'lucide-react';
import Badge, { SlotStatusColor } from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { parkingApi } from '../api';
import type { ParkingSlot } from '../types';

export default function ParkingSlots() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<ParkingSlot | null>(null);

  const fetchSlots = useCallback(() => parkingApi.getSlots({
    search: search || undefined,
    status: filter !== 'ALL' ? filter : undefined,
  }), [search, filter]);

  const { data: slots, loading } = usePolling(fetchSlots, 5000);

  const floors = [...new Set(slots?.map((s) => s.floor) || [])].sort();

  if (loading && !slots) return <LoadingSpinner message="Loading slots..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-field pl-10" placeholder="Search slots..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
        Arduino HC-SR04 sensor data updating every 15s
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map((status) => (
          <div key={status} className="card p-3 text-center">
            <Badge status={status} />
            <p className="text-2xl font-bold mt-2">{slots?.filter((s) => s.status === status).length || 0}</p>
          </div>
        ))}
      </div>

      {floors.map((floor) => (
        <div key={floor}>
          <h3 className="font-semibold mb-3">Floor {floor}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {slots?.filter((s) => s.floor === floor).map((slot) => (
              <button key={slot.id} onClick={() => setSelected(slot)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${SlotStatusColor(slot.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{slot.slotNumber}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${slot.status === 'AVAILABLE' ? 'bg-emerald-500' : slot.status === 'OCCUPIED' ? 'bg-red-500' : 'bg-amber-500'}`} />
                </div>
                <Badge status={slot.status} />
                {slot.transactions?.[0]?.vehicle && (
                  <p className="mt-2 text-xs font-mono text-slate-600">{slot.transactions[0].vehicle.plateNumber}</p>
                )}
                <p className="mt-2 text-[10px] text-slate-400">Zone {slot.zone} · {slot.sensorValue}cm</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Slot ${selected?.slotNumber}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-500">Floor:</span> <span className="font-medium">{selected.floor}</span></div>
              <div><span className="text-slate-500">Zone:</span> <span className="font-medium">{selected.zone}</span></div>
              <div><span className="text-slate-500">Status:</span> <Badge status={selected.status} /></div>
              <div><span className="text-slate-500">Sensor:</span> <span className="font-medium">{selected.sensorValue}cm</span></div>
            </div>
            {selected.transactions?.[0]?.vehicle && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-mono font-medium">{selected.transactions[0].vehicle.plateNumber}</p>
                <p className="text-slate-500">{selected.transactions[0].vehicle.ownerName}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
