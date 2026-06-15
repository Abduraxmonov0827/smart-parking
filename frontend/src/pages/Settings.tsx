import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Radio, Cpu, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { settingsApi, authApi } from '../api';
import { useAuthStore } from '../store/authStore';
import type { SystemSettings } from '../types';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(user);

  const fetchSettings = useCallback(() => settingsApi.get(), []);
  const fetchArduino = useCallback(() => settingsApi.getArduino(), []);
  const { data: settings, loading, refresh } = usePolling(fetchSettings, 15000);
  const { data: arduino } = usePolling(fetchArduino, 15000);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Partial<SystemSettings>>();

  useEffect(() => { if (settings) reset(settings); }, [settings, reset]);
  useEffect(() => { authApi.getProfile().then(setProfile).catch(() => {}); }, []);

  const onSave = async (data: Record<string, unknown>) => {
    try {
      await settingsApi.update({
        ...data,
        arduinoEnabled: data.arduinoEnabled === true || data.arduinoEnabled === 'true',
      } as Partial<SystemSettings>);
      setMessage('Settings saved successfully');
      refresh();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Failed to save settings'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl space-y-6">
      {message && <div className={`p-4 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4"><User className="w-5 h-5 text-blue-600" /><h3 className="font-semibold">User Profile</h3></div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">Username:</span> <span className="font-medium ml-2">{profile?.username}</span></div>
          <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">Email:</span> <span className="font-medium ml-2">{profile?.email}</span></div>
          <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">Role:</span> <span className="font-medium ml-2">{profile?.role}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Facility Configuration</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Facility Name</label><input className="input-field" {...register('facilityName')} /></div>
            <div><label className="label">Open Time</label><input type="time" className="input-field" {...register('openTime')} /></div>
            <div><label className="label">Close Time</label><input type="time" className="input-field" {...register('closeTime')} /></div>
            <div><label className="label">Hourly Rate ($)</label><input type="number" step="0.5" className="input-field" {...register('hourlyRate', { valueAsNumber: true })} /></div>
            <div><label className="label">Total Slots</label><input type="number" className="input-field" {...register('totalSlots', { valueAsNumber: true })} /></div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4"><Cpu className="w-5 h-5 text-blue-600" /><h3 className="font-semibold">Arduino Sensor Simulation</h3></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Simulator</label>
              <select className="input-field" {...register('arduinoEnabled')}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div><label className="label">Threshold (cm)</label>
              <input type="number" className="input-field" {...register('sensorThreshold', { valueAsNumber: true })} />
              <p className="text-xs text-slate-400 mt-1">HC-SR04: distance below = vehicle detected</p>
            </div>
          </div>
          {arduino && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 mb-3">
                <Radio className="w-4 h-4 animate-pulse" /> Live Readings ({arduino.readings?.length} slots)
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                {arduino.readings.map((r) => (
                  <div key={r.id} className="text-center p-2 bg-white rounded border text-xs">
                    <p className="text-slate-400">{r.slotNumber}</p>
                    <p className="font-mono font-medium">{r.sensorValue}cm</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'OPERATOR') && (
          <button type="submit" disabled={isSubmitting} className="btn-primary"><Save className="w-4 h-4" />{isSubmitting ? 'Saving...' : 'Save Settings'}</button>
        )}
      </form>
    </div>
  );
}
