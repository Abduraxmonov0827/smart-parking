import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ParkingSquare } from 'lucide-react';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';

interface LoginForm { email: string; password: string; }

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const result = await authApi.login(data.email, data.password);
      setAuth(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <ParkingSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Parking System</h1>
          <p className="text-blue-200 text-sm mt-1">Arduino-Based Automated Parking</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Sign In</h2>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" placeholder="admin@parking.com"
              {...register('email', { required: true })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••"
              {...register('password', { required: true })} />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Demo: admin@parking.com / admin123
          </p>
        </form>

        <p className="text-center text-blue-200 text-sm mt-4">
          <Link to="/" className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
