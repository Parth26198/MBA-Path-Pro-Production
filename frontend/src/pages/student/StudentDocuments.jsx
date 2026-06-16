import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi, uploadApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { PageState } from '@/components/shared/PageState';
import { Upload, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export default function StudentDocuments() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', category: 'resume', file: null });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-documents'],
    queryFn: studentApi.documents,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('file', form.file);
      fd.append('title', form.title || form.file.name);
      fd.append('category', form.category);
      return uploadApi.document(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-documents'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
      setForm({ title: '', category: 'resume', file: null });
    },
  });

  const docs = data?.data || [];

  const handleUpload = (e) => {
    e.preventDefault();
    if (!form.file) return;
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Uploaded Documents</h2>

      <form onSubmit={handleUpload} className="rounded-2xl border bg-white p-6 space-y-4">
        <h3 className="font-semibold">Upload Document</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Updated Resume" />
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="resume">Resume</option>
              <option value="sop">SOP</option>
              <option value="transcript">Transcript</option>
              <option value="lor">LOR</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <Label>File (PDF, JPG, PNG, DOC — max 5MB)</Label>
          <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] })} />
        </div>
        {uploadMutation.isError && <p className="text-sm text-red-600">{uploadMutation.error.message}</p>}
        <Button type="submit" disabled={!form.file || uploadMutation.isPending}>
          {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Upload</>}
        </Button>
      </form>

      <PageState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && docs.length === 0}
        emptyTitle="No documents"
        emptyMessage="Upload your SOP, resume, and transcripts for trainer review."
        onRetry={refetch}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <div key={d.id} className="rounded-2xl border bg-white p-5">
              <h3 className="font-medium">{d.title}</h3>
              <p className="text-xs text-slate-500">{d.category} · {d.file_type}</p>
              <Badge className="mt-2" variant={d.status === 'verified' ? 'success' : d.status === 'rejected' ? 'danger' : 'warning'}>
                {d.status}
              </Badge>
              {d.rejection_reason && <p className="mt-2 text-sm text-red-600">{d.rejection_reason}</p>}
              {d.file_url && (
                <a href={`${API_BASE}${d.file_url}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  View file
                </a>
              )}
            </div>
          ))}
        </div>
      </PageState>
    </div>
  );
}
