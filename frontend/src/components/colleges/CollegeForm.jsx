import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { uploadApi } from '@/lib/api';
import {
  croresToAnnualRupees,
  lpaToAnnualRupees,
  toCrores,
  toLPA,
} from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

const emptyForm = {
  name: '',
  description: '',
  location: '',
  city: '',
  state: '',
  ranking: '',
  fees_min: '',
  fees_max: '',
  avg_package: '',
  highest_package: '',
  eligibility: '',
  admission_process: '',
  website: '',
  contact_email: '',
  contact_phone: '',
  accepted_exams: '',
  deadlines: '',
  specializations: '',
  logo_url: '',
  status: 'draft',
};

export function collegeToForm(c) {
  if (!c) return { ...emptyForm };
  return {
    name: c.name || '',
    description: c.description || '',
    location: c.location || '',
    city: c.city || '',
    state: c.state || '',
    ranking: c.ranking ?? '',
    fees_min: c.fees_min ?? '',
    fees_max: c.fees_max ?? '',
    avg_package:
      c.avg_package != null && c.avg_package !== ''
        ? (toLPA(c.avg_package)?.toFixed(1) ?? '')
        : '',
    highest_package:
      c.highest_package != null && c.highest_package !== ''
        ? (toCrores(c.highest_package)?.toFixed(2) ?? '')
        : '',
    eligibility: c.eligibility || '',
    admission_process: c.admission_process || '',
    website: c.website || '',
    contact_email: c.contact_email || '',
    contact_phone: c.contact_phone || '',
    accepted_exams: Array.isArray(c.accepted_exams) ? c.accepted_exams.join(', ') : '',
    deadlines: typeof c.deadlines === 'object' ? JSON.stringify(c.deadlines, null, 2) : '',
    specializations: Array.isArray(c.specializations) ? c.specializations.join(', ') : '',
    logo_url: c.logo_url || '',
    status: c.status || 'draft',
  };
}

export function formToPayload(form) {
  let deadlines = {};
  if (form.deadlines?.trim()) {
    try {
      deadlines = JSON.parse(form.deadlines);
    } catch {
      deadlines = { application: form.deadlines.trim() };
    }
  }
  return {
    name: form.name,
    description: form.description || null,
    location: form.location || null,
    city: form.city || null,
    state: form.state || null,
    ranking: form.ranking ? parseInt(form.ranking, 10) : null,
    fees_min: form.fees_min ? parseFloat(form.fees_min) : null,
    fees_max: form.fees_max ? parseFloat(form.fees_max) : null,
    avg_package: form.avg_package ? lpaToAnnualRupees(parseFloat(form.avg_package)) : null,
    highest_package: form.highest_package
      ? croresToAnnualRupees(parseFloat(form.highest_package))
      : null,
    eligibility: form.eligibility || null,
    admission_process: form.admission_process || null,
    website: form.website || null,
    contact_email: form.contact_email || null,
    contact_phone: form.contact_phone || null,
    accepted_exams: form.accepted_exams
      ? form.accepted_exams.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    deadlines,
    specializations: form.specializations
      ? form.specializations.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    logo_url: form.logo_url || null,
    status: form.status,
  };
}

export function CollegeForm({ initial, onSubmit, onCancel, loading, error, showStatus = true, adminMode = false }) {
  const [form, setForm] = useState(() => collegeToForm(initial));
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadApi.collegeImage(fd);
      setForm((f) => ({ ...f, logo_url: res.data.file_url }));
    } finally {
      setUploading(false);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formToPayload(form));
      }}
      className="space-y-4 rounded-2xl border bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>College Name *</Label>
          <Input required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div><Label>Location</Label><Input value={form.location} onChange={(e) => set('location', e.target.value)} /></div>
        <div><Label>City</Label><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
        <div><Label>State</Label><Input value={form.state} onChange={(e) => set('state', e.target.value)} /></div>
        <div><Label>Ranking</Label><Input type="number" value={form.ranking} onChange={(e) => set('ranking', e.target.value)} /></div>
        <div><Label>Fees Min (₹)</Label><Input type="number" value={form.fees_min} onChange={(e) => set('fees_min', e.target.value)} /></div>
        <div><Label>Fees Max (₹)</Label><Input type="number" value={form.fees_max} onChange={(e) => set('fees_max', e.target.value)} /></div>
        <div><Label>Avg Package (LPA)</Label><Input type="number" step="0.1" placeholder="36.5" value={form.avg_package} onChange={(e) => set('avg_package', e.target.value)} /></div>
        <div><Label>Highest Package (Cr)</Label><Input type="number" step="0.01" placeholder="1.15" value={form.highest_package} onChange={(e) => set('highest_package', e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Eligibility</Label><Input value={form.eligibility} onChange={(e) => set('eligibility', e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Admission Process</Label><Input value={form.admission_process} onChange={(e) => set('admission_process', e.target.value)} /></div>
        <div><Label>Website</Label><Input value={form.website} onChange={(e) => set('website', e.target.value)} /></div>
        <div><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} /></div>
        <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} /></div>
        <div className="md:col-span-2">
          <Label>Accepted Exams (comma-separated)</Label>
          <Input placeholder="CAT, XAT, GMAT" value={form.accepted_exams} onChange={(e) => set('accepted_exams', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Deadlines (JSON or text)</Label>
          <Input placeholder='{"application": "2026-03-31"}' value={form.deadlines} onChange={(e) => set('deadlines', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Specializations (comma-separated)</Label>
          <Input placeholder="Finance, Marketing, HR" value={form.specializations} onChange={(e) => set('specializations', e.target.value)} />
        </div>
        {(showStatus || adminMode) && (
          <div>
            <Label>Status</Label>
            <select className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {adminMode ? (
                <>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="archived">Archived</option>
                </>
              )}
            </select>
          </div>
        )}
        <div className="md:col-span-2">
          <Label>Logo</Label>
          <div className="flex flex-wrap items-center gap-3">
            <Input type="file" accept="image/*" onChange={handleLogoUpload} className="max-w-xs" />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {form.logo_url && (
              <img src={`${API_BASE}${form.logo_url}`} alt="Logo" className="h-12 w-12 rounded-lg border object-cover" />
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Save</>}
        </Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
