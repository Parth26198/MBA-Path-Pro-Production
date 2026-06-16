import { useState } from 'react';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await publicApi.contact(form);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Contact Us</h1>
      <p className="mt-2 text-slate-600">Get a free MBA profile evaluation within 24 hours</p>
      {sent ? (
        <p className="mt-8 rounded-xl bg-emerald-50 p-6 text-emerald-800">Thank you! Our team will contact you soon.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Message</Label><Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      )}
    </div>
  );
}
