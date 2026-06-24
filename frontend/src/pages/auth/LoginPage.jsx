import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore, getDashboardPath } from '@/store/authStore';
import { Button } from '@/components/ui/button';

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
      navigate(getDashboardPath(res.data.user.role, res.data.profile));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-surface-muted px-5 py-16 dark:bg-slate-950">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <GraduationCap className="h-5 w-5" />
            </span>
            MBA Path Pro
          </Link>
        </div>

        <div className="platform-card p-8 shadow-soft md:p-10">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Sign in to continue your MBA journey</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="platform-label">Email</label>
              <input
                id="email"
                type="email"
                required
                className="platform-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="platform-label">Password</label>
              <input
                id="password"
                type="password"
                required
                className="platform-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-danger-500" role="alert">{error}</p>}
            <Button type="submit" className="h-12 w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm">
              <Link to="/forgot-password" className="text-brand-600 hover:text-brand-700">Forgot password?</Link>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            New here?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
