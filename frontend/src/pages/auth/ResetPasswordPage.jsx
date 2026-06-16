import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, password });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-red-600">Invalid reset link.</p>
        <Link to="/forgot-password" className="mt-4 inline-block text-brand-600 hover:underline">Request new link</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="font-display text-2xl font-bold">Reset Password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label>New Password</Label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}
