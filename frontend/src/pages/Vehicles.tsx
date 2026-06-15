import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Trash2, Edit, History } from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { vehicleApi } from '../api';
import type { Vehicle, ParkingTransaction } from '../types';

interface VehicleForm { plateNumber: string; ownerName: string; vehicleType: string; color: string; phone: string; }

export default function Vehicles() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'history' | null>(null);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<ParkingTransaction[]>([]);
  const [error, setError] = useState('');

  const fetchVehicles = useCallback(() => vehicleApi.getAll(search || undefined), [search]);
  const { data: vehicles, loading, refresh } = usePolling(fetchVehicles, 5000);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<VehicleForm>({
    defaultValues: { vehicleType: 'car', color: 'white' },
  });

  const openCreate = () => { reset({ vehicleType: 'car', color: 'white', plateNumber: '', ownerName: '', phone: '' }); setError(''); setModal('create'); };
  const openEdit = (v: Vehicle) => { reset(v); setSelected(v); setError(''); setModal('edit'); };
  const openHistory = async (v: Vehicle) => {
    setSelected(v);
    const data = await vehicleApi.getHistory(v.id);
    setHistory(data);
    setModal('history');
  };

  const onSubmit = async (data: VehicleForm) => {
    setError('');
    try {
      if (modal === 'create') await vehicleApi.create(data);
      else if (modal === 'edit' && selected) await vehicleApi.update(selected.id, data);
      setModal(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    try { await vehicleApi.delete(id); refresh(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  if (loading && !vehicles) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input-field pl-10" placeholder="Search by plate or owner..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Register Vehicle</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Plate</th>
                <th className="text-left px-5 py-3 font-medium">Owner</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Color</th>
                <th className="text-left px-5 py-3 font-medium">Sessions</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles?.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono font-medium">{v.plateNumber}</td>
                  <td className="px-5 py-3">{v.ownerName}</td>
                  <td className="px-5 py-3 capitalize">{v.vehicleType}</td>
                  <td className="px-5 py-3 capitalize">{v.color}</td>
                  <td className="px-5 py-3">{v._count?.transactions || 0}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openHistory(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="History"><History className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(v)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Register Vehicle' : 'Edit Vehicle'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <div><label className="label">Plate Number</label><input className="input-field font-mono" {...register('plateNumber', { required: true })} /></div>
          <div><label className="label">Owner Name</label><input className="input-field" {...register('ownerName', { required: true })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Type</label>
              <select className="input-field" {...register('vehicleType')}>
                {['car', 'suv', 'truck', 'motorcycle', 'van'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Color</label><input className="input-field" {...register('color')} /></div>
          </div>
          <div><label className="label">Phone</label><input className="input-field" {...register('phone')} /></div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Saving...' : modal === 'create' ? 'Register' : 'Update'}
          </button>
        </form>
      </Modal>

      <Modal open={modal === 'history'} onClose={() => setModal(null)} title={`History — ${selected?.plateNumber}`} size="lg">
        {history.length === 0 ? <p className="text-sm text-slate-500">No parking history</p> : (
          <div className="space-y-3">
            {history.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-lg text-sm flex justify-between">
                <div>
                  <p className="font-medium">Slot {t.slot?.slotNumber}</p>
                  <p className="text-slate-500">{new Date(t.entryTime).toLocaleString()} — {t.exitTime ? new Date(t.exitTime).toLocaleString() : 'Active'}</p>
                </div>
                <div className="text-right">
                  <Badge status={t.status} />
                  {t.fee > 0 && <p className="font-medium mt-1">${t.fee.toFixed(2)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
