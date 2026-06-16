import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="font-display text-2xl font-bold">Forgot Password</h1>
      <p className="mt-2 text-sm text-slate-500">Enter your email to receive a reset link.</p>
      {sent ? (
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          If an account exists for that email, a reset link has been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
          </Button>
        </form>
      )}
      <Link to="/login" className="mt-4 inline-block text-sm text-brand-600 hover:underline">Back to login</Link>
    </div>
  );
}
