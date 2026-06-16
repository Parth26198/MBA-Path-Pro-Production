import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useAuthStore, getDashboardPath } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      setAuth({ token: res.data.token, user: res.data.user, profile: res.data.profile });
      navigate(getDashboardPath(res.data.user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-premium">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-brand-700">
          <GraduationCap className="h-7 w-7" /> MBA Path Pro
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to your portal</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          <p className="text-center text-sm">
            <Link to="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
          </p>
        </form>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold">Demo accounts:</p>
          <p>Admin: yash@admin.com</p>
          <p>Trainer: aniket@trainer.com</p>
          <p>Student: paresh@student.com</p>
          <p>Password: 123456</p>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link to="/" className="text-brand-600 hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
