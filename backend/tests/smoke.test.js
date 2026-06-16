/**
 * MBA Path Pro RC Smoke Test Suite
 * Run: node tests/smoke.test.js (backend must be on :5000)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = process.env.API_URL || 'http://localhost:5000/api/v1';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const results = { passed: [], failed: [], fixed: [] };

async function req(method, path, { token, body, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let fetchBody = body ? JSON.stringify(body) : undefined;
  if (formData) {
    fetchBody = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: fetchBody });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

function record(name, ok, detail = '') {
  if (ok) results.passed.push(name);
  else results.failed.push({ name, detail });
}

// --- PUBLIC ---
test('Public: health', async () => {
  const res = await fetch('http://localhost:5000/health');
  const body = await res.json();
  record('Public: health', res.status === 200 && body.success, JSON.stringify(body));
  assert.equal(res.status, 200);
});

test('Public: packages', async () => {
  const { status, json } = await req('GET', '/public/packages');
  record('Public: packages', status === 200 && json.success, json.message);
  assert.ok(json.data?.length > 0);
});

test('Public: colleges', async () => {
  const { status, json } = await req('GET', '/public/colleges');
  record('Public: colleges', status === 200 && json.success);
  assert.ok(json.data?.length > 0);
});

test('Public: featured colleges', async () => {
  const { status, json } = await req('GET', '/public/colleges/featured');
  record('Public: featured colleges', status === 200 && json.success, json.message);
  assert.equal(status, 200);
});

test('Public: stats', async () => {
  const { status, json } = await req('GET', '/public/stats');
  record('Public: stats', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Public: contact', async () => {
  const { status, json } = await req('POST', '/public/contact', {
    body: { name: 'RC Test', email: 'rc@test.com', phone: '9999999999', message: 'Smoke test' },
  });
  record('Public: contact', status === 200 && json.success, json.message);
  assert.equal(status, 200);
});

// --- AUTH ---
let studentToken, trainerToken, adminToken;
let studentProfile;

test('Auth: login admin', async () => {
  const { status, json } = await req('POST', '/auth/login', {
    body: { email: 'yash@admin.com', password: '123456' },
  });
  adminToken = json.data?.token;
  record('Auth: login admin', status === 200 && adminToken);
  assert.ok(adminToken);
});

test('Auth: login trainer', async () => {
  const { status, json } = await req('POST', '/auth/login', {
    body: { email: 'aniket@trainer.com', password: '123456' },
  });
  trainerToken = json.data?.token;
  record('Auth: login trainer', status === 200 && trainerToken);
  assert.ok(trainerToken);
});

test('Auth: login student', async () => {
  const { status, json } = await req('POST', '/auth/login', {
    body: { email: 'paresh@student.com', password: '123456' },
  });
  studentToken = json.data?.token;
  studentProfile = json.data?.profile;
  record('Auth: login student', status === 200 && studentToken);
  assert.ok(studentToken);
});

test('Auth: forgot password', async () => {
  const { status, json } = await req('POST', '/auth/forgot-password', {
    body: { email: 'paresh@student.com' },
  });
  record('Auth: forgot password', status === 200 && json.success, json.message);
  assert.equal(status, 200);
});

test('Auth: invalid login rejected', async () => {
  const { status } = await req('POST', '/auth/login', {
    body: { email: 'paresh@student.com', password: 'wrongpassword' },
  });
  record('Auth: invalid login rejected', status === 401);
  assert.equal(status, 401);
});

// --- RBAC ---
test('Security: student blocked from admin', async () => {
  const { status } = await req('GET', '/admin/dashboard', { token: studentToken });
  record('Security: RBAC student→admin', status === 403);
  assert.equal(status, 403);
});

test('Security: student blocked from trainer', async () => {
  const { status } = await req('GET', '/trainer/dashboard', { token: studentToken });
  record('Security: RBAC student→trainer', status === 403);
  assert.equal(status, 403);
});

test('Security: trainer blocked from admin', async () => {
  const { status } = await req('GET', '/admin/dashboard', { token: trainerToken });
  record('Security: RBAC trainer→admin', status === 403);
  assert.equal(status, 403);
});

// --- STUDENT ---
test('Student: dashboard', async () => {
  const { status, json } = await req('GET', '/student/dashboard', { token: studentToken });
  record('Student: dashboard', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Student: applications', async () => {
  const { status, json } = await req('GET', '/student/applications', { token: studentToken });
  record('Student: applications', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Student: available colleges', async () => {
  const { status, json } = await req('GET', '/student/colleges/available', { token: studentToken });
  record('Student: available colleges', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Student: documents list', async () => {
  const { status, json } = await req('GET', '/student/documents', { token: studentToken });
  record('Student: documents list', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Student: payment history', async () => {
  const { status, json } = await req('GET', '/student/payments/history', { token: studentToken });
  record('Student: payment history', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Student: notifications', async () => {
  const { status, json } = await req('GET', '/notifications', { token: studentToken });
  record('Student: notifications', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Student: unread count', async () => {
  const { status, json } = await req('GET', '/notifications/unread-count', { token: studentToken });
  record('Student: unread count', status === 200 && json.success);
  assert.equal(status, 200);
});

// --- TRAINER ---
test('Trainer: dashboard', async () => {
  const { status, json } = await req('GET', '/trainer/dashboard', { token: trainerToken });
  record('Trainer: dashboard', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Trainer: applications', async () => {
  const { status, json } = await req('GET', '/trainer/applications', { token: trainerToken });
  record('Trainer: applications', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Trainer: application statuses', async () => {
  const { status, json } = await req('GET', '/trainer/applications/statuses', { token: trainerToken });
  record('Trainer: application statuses', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Trainer: preparation', async () => {
  const { status, json } = await req('GET', '/trainer/preparation', { token: trainerToken });
  record('Trainer: preparation', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Trainer: sessions', async () => {
  const { status, json } = await req('GET', '/trainer/sessions', { token: trainerToken });
  record('Trainer: sessions', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Trainer: documents', async () => {
  const { status, json } = await req('GET', '/trainer/documents', { token: trainerToken });
  record('Trainer: documents', status === 200 && json.success);
  assert.equal(status, 200);
});

// --- ADMIN ---
test('Admin: dashboard', async () => {
  const { status, json } = await req('GET', '/admin/dashboard', { token: adminToken });
  record('Admin: dashboard', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: students', async () => {
  const { status, json } = await req('GET', '/admin/students', { token: adminToken });
  record('Admin: students', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: trainers', async () => {
  const { status, json } = await req('GET', '/admin/trainers', { token: adminToken });
  record('Admin: trainers', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: packages', async () => {
  const { status, json } = await req('GET', '/admin/packages', { token: adminToken });
  record('Admin: packages', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: payments', async () => {
  const { status, json } = await req('GET', '/admin/payments', { token: adminToken });
  record('Admin: payments', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: documents', async () => {
  const { status, json } = await req('GET', '/admin/documents', { token: adminToken });
  record('Admin: documents', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: audit logs', async () => {
  const { status, json } = await req('GET', '/admin/audit-logs', { token: adminToken });
  record('Admin: audit logs', status === 200 && json.success);
  assert.equal(status, 200);
});

test('Admin: applications', async () => {
  const { status, json } = await req('GET', '/admin/applications', { token: adminToken });
  record('Admin: applications', status === 200 && json.success);
  assert.equal(status, 200);
});

// --- WORKFLOW: trainer update application ---
test('Trainer: update application status', async () => {
  const apps = await req('GET', '/trainer/applications', { token: trainerToken });
  const app = apps.json.data?.[0];
  if (!app) {
    record('Trainer: update application status', false, 'No applications');
    return;
  }
  const { status, json } = await req('PUT', `/trainer/applications/${app.id}`, {
    token: trainerToken,
    body: { status: app.status, remarks: 'RC smoke test remark' },
  });
  record('Trainer: update application status', status === 200 && json.success, json.message);
  assert.equal(status, 200);
});

// --- WORKFLOW: create prep task + student complete + trainer verify ---
test('Trainer: create preparation task', async () => {
  const students = await req('GET', '/trainer/students', { token: trainerToken });
  const student = students.json.data?.[0];
  if (!student) {
    record('Trainer: create preparation task', false, 'No students');
    return;
  }
  const { status, json } = await req('POST', '/trainer/preparation', {
    token: trainerToken,
    body: { student_id: student.id, title: 'RC Smoke Task', description: 'Test task' },
  });
  record('Trainer: create preparation task', status === 201 && json.success, json.message);
  assert.equal(status, 201);
});

// --- WORKFLOW: create session ---
test('Trainer: create session', async () => {
  const students = await req('GET', '/trainer/students', { token: trainerToken });
  const student = students.json.data?.[0];
  if (!student) {
    record('Trainer: create session', false, 'No students');
    return;
  }
  const { status, json } = await req('POST', '/trainer/sessions', {
    token: trainerToken,
    body: {
      student_id: student.id,
      session_type: 'google_meet',
      title: 'RC Smoke Session',
      scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
      duration_minutes: 60,
      meet_link: 'https://meet.google.com/rc-smoke',
    },
  });
  record('Trainer: create session', status === 201 && json.success, json.message);
  assert.equal(status, 201);
});

// --- SECURITY: upload invalid file type ---
test('Security: upload invalid file type rejected', async () => {
  const fd = new FormData();
  const blob = new Blob(['<?php echo "bad";'], { type: 'application/x-php' });
  fd.append('file', blob, 'malicious.php');
  fd.append('title', 'Bad file');
  const { status } = await req('POST', '/uploads/document', { token: studentToken, formData: fd });
  record('Security: upload invalid file type', status === 400 || status === 500, `status=${status}`);
});

// --- PAYMENTS ---
test('Student: create payment order (simulated)', async () => {
  const { status, json } = await req('POST', '/student/payments/create-order', {
    token: studentToken,
    body: { package_id: studentProfile?.package_id || 1 },
  });
  // May succeed (simulated) or fail if already paid - both acceptable
  const ok = status === 201 || status === 200 || (status === 400 && json.message?.includes('package'));
  record('Student: create payment order', ok, `${status}: ${json.message}`);
});

test('Payments: razorpay key endpoint', async () => {
  const { status, json } = await req('GET', '/payments/razorpay-key');
  record('Payments: razorpay key', status === 200 && json.success);
  assert.equal(status, 200);
});

// Write results after all tests
test.after(() => {
  const reportPath = path.join(__dirname, 'smoke-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('\n=== SMOKE TEST SUMMARY ===');
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.failed.length) {
    results.failed.forEach((f) => console.log(`  FAIL: ${f.name} — ${f.detail}`));
  }
});
