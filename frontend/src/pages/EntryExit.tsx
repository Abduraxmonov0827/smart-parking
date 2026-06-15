import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, LogOut, Clock } from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { parkingApi } from '../api';

interface CheckForm { plateNumber: string; }

export default function EntryExit() {
  const [tab, setTab] = useState<'checkin' | 'checkout' | 'logs'>('checkin');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchActive = useCallback(() => parkingApi.getActive(), []);
  const fetchLogs = useCallback(() => parkingApi.getLogs(), []);
  const { data: active, loading: loadingActive, refresh: refreshActive } = usePolling(fetchActive, 5000);
  const { data: logs, loading: loadingLogs } = usePolling(fetchLogs, 10000);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CheckForm>();

  const onCheckIn = async (data: CheckForm) => {
    setError(''); setMessage('');
    try {
      const result = await parkingApi.checkIn(data.plateNumber);
      setMessage(`✓ Check-in: ${result.vehicle?.plateNumber} → Slot ${result.slot?.slotNumber}`);
      reset();
      refreshActive();
    } catch (err) { setError(err instanceof Error ? err.message : 'Check-in failed'); }
  };

  const onCheckOut = async (data: CheckForm) => {
    setError(''); setMessage('');
    try {
      const result = await parkingApi.checkOut(data.plateNumber);
      setMessage(`✓ Check-out: ${result.vehicle?.plateNumber} — Duration: ${result.duration}min — Fee: $${result.fee.toFixed(2)}`);
      reset();
      refreshActive();
    } catch (err) { setError(err instanceof Error ? err.message : 'Check-out failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['checkin', 'checkout', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setError(''); setMessage(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t === 'checkin' ? 'Check-In' : t === 'checkout' ? 'Check-Out' : 'Transaction Logs'}
          </button>
        ))}
      </div>

      {message && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{message}</div>}
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {(tab === 'checkin' || tab === 'checkout') && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              {tab === 'checkin' ? <LogIn className="w-5 h-5 text-emerald-600" /> : <LogOut className="w-5 h-5 text-red-500" />}
              <h3 className="font-semibold">{tab === 'checkin' ? 'Vehicle Check-In' : 'Vehicle Check-Out'}</h3>
            </div>
            <form onSubmit={handleSubmit(tab === 'checkin' ? onCheckIn : onCheckOut)} className="space-y-4">
              <div>
                <label className="label">License Plate</label>
                <input className="input-field font-mono text-lg" placeholder="ABC-1234" {...register('plateNumber', { required: true })} />
              </div>
              <p className="text-xs text-slate-500">
                {tab === 'checkin' ? 'Vehicle must be registered. An available slot will be assigned automatically.' : 'Parking fee is calculated based on duration and hourly rate.'}
              </p>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Processing...' : tab === 'checkin' ? 'Check In' : 'Check Out'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Active Sessions ({active?.length || 0})</h3>
            </div>
            {loadingActive ? <LoadingSpinner /> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {active?.length === 0 && <p className="text-sm text-slate-500">No active sessions</p>}
                {active?.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-lg text-sm flex justify-between">
                    <div>
                      <p className="font-mono font-medium">{t.vehicle?.plateNumber}</p>
                      <p className="text-slate-500">Slot {t.slot?.slotNumber} · {t.vehicle?.ownerName}</p>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(t.entryTime).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="card overflow-hidden">
          {loadingLogs ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                    <th className="text-left px-5 py-3 font-medium">Slot</th>
                    <th className="text-left px-5 py-3 font-medium">Entry</th>
                    <th className="text-left px-5 py-3 font-medium">Exit</th>
                    <th className="text-left px-5 py-3 font-medium">Duration</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs?.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono">{t.vehicle?.plateNumber}</td>
                      <td className="px-5 py-3">{t.slot?.slotNumber}</td>
                      <td className="px-5 py-3 text-slate-500">{new Date(t.entryTime).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-500">{t.exitTime ? new Date(t.exitTime).toLocaleString() : '—'}</td>
                      <td className="px-5 py-3">{t.duration ? `${t.duration} min` : '—'}</td>
                      <td className="px-5 py-3"><Badge status={t.status} /></td>
                      <td className="px-5 py-3 text-right font-medium">{t.fee > 0 ? `$${t.fee.toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
