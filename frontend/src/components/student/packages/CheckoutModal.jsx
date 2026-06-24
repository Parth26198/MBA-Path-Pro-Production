import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/lib/api';
import { formatPackage } from '@/lib/utils';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

export function CheckoutModal({ open, onOpenChange, package: pkg, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setLoading(false);
      setError('');
    }
  }, [open]);

  if (!pkg) return null;

  const handlePayment = async () => {
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
            modal: { ondismiss: () => reject({ message: 'Payment cancelled' }) },
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', async (resp) => {
            await paymentApi.failed({ order_id: order.orderId, reason: resp.error?.description });
            reject({ message: resp.error?.description || 'Payment failed' });
          });
          rzp.open();
        });
      } else if (order.mode === 'simulated' && order.success) {
        // completed server-side
      } else {
        throw new Error('Unable to process payment');
      }

      setStep(3);
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
      }, 1800);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{step === 3 ? 'Success!' : `Purchase ${pkg.name}`}</DialogTitle>
          {step < 3 && (
            <div className="mt-2 flex gap-2 text-xs">
              {['Confirm', 'Payment', 'Done'].map((label, i) => (
                <span
                  key={label}
                  className={`rounded-full px-2 py-1 ${step > i ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'}`}
                >
                  {i + 1}. {label}
                </span>
              ))}
            </div>
          )}
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-bold">{pkg.name}</p>
              <p className="text-2xl font-bold text-brand-700">{formatPackage(pkg.price)}</p>
              <p className="text-sm text-slate-500">{pkg.college_limit} college applications included</p>
            </div>
            <Button className="w-full" variant="premium" onClick={() => setStep(2)}>
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-4">
              <p className="text-sm text-slate-500">Order total</p>
              <p className="text-2xl font-bold">{formatPackage(pkg.price)}</p>
            </div>
            {error && <p className="text-sm text-danger-500">{error}</p>}
            <Button className="w-full" variant="premium" onClick={handlePayment} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> Pay Securely</>}
            </Button>
          </div>
        )}

        {step === 3 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="font-display text-lg font-bold">Package Activated!</p>
            <p className="text-sm text-slate-500">You can now apply to {pkg.college_limit} colleges.</p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
