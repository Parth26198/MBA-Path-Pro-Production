/**
 * CRUD workflow verification
 * Run with backend on :5000
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = 'http://localhost:5000/api/v1';
let adminToken, trainerToken, studentToken;

async function req(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

test('Login roles', async () => {
  const a = await req('POST', '/auth/login', { body: { email: 'yash@admin.com', password: '123456' } });
  const t = await req('POST', '/auth/login', { body: { email: 'aniket@trainer.com', password: '123456' } });
  const s = await req('POST', '/auth/login', { body: { email: 'paresh@student.com', password: '123456' } });
  adminToken = a.json.data?.token;
  trainerToken = t.json.data?.token;
  studentToken = s.json.data?.token;
  assert.ok(adminToken && trainerToken && studentToken);
});

test('Admin: create trainer (no undefined bind)', async () => {
  const email = `crudtrainer${Date.now()}@test.com`;
  const { status, json } = await req('POST', '/admin/trainers', {
    token: adminToken,
    body: { name: 'CRUD Trainer', email, password: '123456', specialization: 'MBA' },
  });
  assert.equal(status, 201, json.message);
});

test('Admin: create student', async () => {
  const email = `crudstudent${Date.now()}@test.com`;
  const { status } = await req('POST', '/admin/students', {
    token: adminToken,
    body: { name: 'CRUD Student', email, password: '123456', package_id: 1 },
  });
  assert.equal(status, 201);
});

test('Trainer: create college draft', async () => {
  const { status, json } = await req('POST', '/trainer/colleges', {
    token: trainerToken,
    body: { name: `CRUD College ${Date.now()}`, city: 'Mumbai', fees_min: 100000, fees_max: 200000 },
  });
  assert.equal(status, 201, json.message);
});

test('Register with auto roles', async () => {
  const email = `crudreg${Date.now()}@test.com`;
  const { status } = await req('POST', '/auth/register', {
    body: { name: 'CRUD Reg', email, password: '123456' },
  });
  assert.equal(status, 201);
});
