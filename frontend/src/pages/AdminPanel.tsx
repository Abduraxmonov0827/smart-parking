import { useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePolling } from '../hooks/usePolling';
import { adminApi } from '../api';

export default function AdminPanel() {
  const fetchUsers = useCallback(() => adminApi.getUsers(), []);
  const fetchLogs = useCallback(() => adminApi.getLogs(50), []);

  const { data: users, loading: loadingUsers, refresh: refreshUsers } = usePolling(fetchUsers, 10000);
  const { data: logs, loading: loadingLogs } = usePolling(fetchLogs, 10000);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await adminApi.deleteUser(id); refreshUsers(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-200"><h3 className="font-semibold">User Management</h3></div>
        {loadingUsers ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Username</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Created</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium">{u.username}</td>
                    <td className="px-5 py-3">{u.email}</td>
                    <td className="px-5 py-3"><Badge status={u.role} /></td>
                    <td className="px-5 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-200"><h3 className="font-semibold">System Activity Logs</h3></div>
        {loadingLogs ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Action</th>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Details</th>
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs">{log.action}</td>
                    <td className="px-5 py-3">{log.user?.username || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{log.details || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
