import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { authApi, paymentApi } from '@/lib/api';
import { useAuthStore, getDashboardPath } from '@/store/authStore';
import { formatPackage } from '@/lib/utils';
import { CheckCircle2, CreditCard, Loader2, UserPlus } from 'lucide-react';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BuyNowModal({ open, onOpenChange, package: pkg }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    if (!open) {
      setStep(1);
      setLoading(false);
      setError('');
      setAccountCreated(false);
      setForm({ name: '', email: '', phone: '', password: '' });
    }
  }, [open]);

  if (!pkg) return null;

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({
        ...form,
        packageId: pkg.id,
      });
      setAuth({
        token: res.data.token,
        user: res.data.user,
        profile: res.data.profile,
      });
      setAccountCreated(true);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!accountCreated) {
      setError('Please create your account before completing payment.');
      setStep(1);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderRes = await paymentApi.createOrder(pkg.id);
      const order = orderRes.data;

      if (order.mode === 'razorpay' && order.keyId) {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Failed to load payment gateway');

        await new Promise((resolve, reject) => {
          const options = {
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'MBA Path Pro',
            description: pkg.name,
            order_id: order.orderId,
            handler: async (response) => {
              try {
                await paymentApi.verify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            modal: {
              ondismiss: () => reject({ message: 'Payment cancelled' }),
            },
            prefill: { email: form.email, name: form.name, contact: form.phone },
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', async (resp) => {
            await paymentApi.failed({ order_id: order.orderId, reason: resp.error?.description });
            reject({ message: resp.error?.description || 'Payment failed' });
          });
          rzp.open();
        });
      } else if (order.mode === 'simulated' && order.success) {
        // Simulated payment completed on server
      } else {
        throw new Error('Unable to process payment');
      }

      setStep(3);
      setTimeout(() => {
        onOpenChange(false);
        navigate(getDashboardPath('STUDENT'));
      }, 1500);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in {pkg.name}</DialogTitle>
          <p className="text-sm text-slate-500">
            {pkg.college_limit} college applications · {formatPackage(pkg.price)}
          </p>
          <div className="mt-3 flex gap-2 text-xs">
            <span className={`rounded-full px-2 py-1 ${step >= 1 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'}`}>
              1. Account
            </span>
            <span className={`rounded-full px-2 py-1 ${step >= 2 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'}`}>
              2. Payment
            </span>
            <span className={`rounded-full px-2 py-1 ${step >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
              3. Done
            </span>
          </div>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <p className="text-sm text-slate-600">Create your student account to continue.</p>
            <div>
              <Label>Full Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Create Account & Continue
                </>
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              Account created for <strong>{form.email}</strong>. Complete payment to activate your package.
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm font-medium">Order Summary</p>
              <p className="mt-1 text-lg font-bold">{formatPackage(pkg.price)}</p>
              <p className="text-xs text-slate-500">{pkg.name} · {pkg.college_limit} college applications</p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" onClick={handleCompletePayment} disabled={loading || !accountCreated}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Complete Payment
                </>
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setStep(1)}>
              Back to account details
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="font-semibold">Payment Successful!</p>
            <p className="text-sm text-slate-500">Redirecting to your student dashboard...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
