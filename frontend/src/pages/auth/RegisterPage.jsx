import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Check } from 'lucide-react';
import { authApi, studentApi } from '@/lib/api';
import { useAuthStore, getDashboardPath } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { RegisterBrandPanel } from '@/components/auth/RegisterBrandPanel';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Singapore', 'Australia', 'Germany', 'UAE', 'Other',
];

const JOURNEY_STEPS = [
  'Create Account',
  'Welcome',
  'Education',
  'Experience',
  'Goals',
  'Matches',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const res = await authApi.register({ name, email: form.email, password: form.password });
      setAuth({ token: res.data.token, user: res.data.user, profile: res.data.profile });

      if (form.country) {
        try {
          await studentApi.updateProfile({ target_countries: [form.country] });
        } catch {
          /* non-blocking */
        }
      }

      navigate(getDashboardPath('STUDENT', res.data.profile));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
      <div className="hidden w-[46%] shrink-0 xl:block">
        <RegisterBrandPanel />
      </div>

      <div className="flex flex-1 flex-col justify-center bg-[#F8FAFC] px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2.5 xl:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <Link to="/" className="font-display text-lg font-semibold text-slate-900">
              MBA Path Pro
            </Link>
          </div>

          {/* Journey preview */}
          <div className="mb-6 hidden overflow-x-auto sm:block">
            <div className="flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wider text-slate-400">
              {JOURNEY_STEPS.map((label, i) => (
                <span key={label} className="flex items-center gap-1 whitespace-nowrap">
                  <span
                    className={`rounded-full px-2 py-1 ${
                      i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'
                    }`}
                  >
                    {label}
                  </span>
                  {i < JOURNEY_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_8px_40px_rgba(12,26,46,0.06)] lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Step 1 of your journey</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Join thousands of professionals discovering their perfect MBA match.
            </p>

            <ul className="mt-6 space-y-2">
              {[
                'Personalized School Matches',
                'Admission Tracker',
                'Program Recommendations',
                'Application Timeline',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="platform-label">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    required
                    className="platform-input"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="platform-label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    required
                    className="platform-input"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="platform-label">
                  Email
                </label>
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
                <label htmlFor="password" className="platform-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  className="platform-input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="platform-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="platform-input"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label htmlFor="country" className="platform-label">
                  Home Country <span className="text-slate-400">(optional)</span>
                </label>
                <select
                  id="country"
                  className="platform-input"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="h-12 w-full rounded-xl bg-[#0F172A] text-base hover:bg-[#1E293B]" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Free Account'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
