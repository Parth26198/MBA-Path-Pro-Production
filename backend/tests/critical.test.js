import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination } from '../src/utils/pagination.js';

test('parsePagination defaults', () => {
  const result = parsePagination({});
  assert.equal(result.page, 1);
  assert.equal(result.limit, 20);
  assert.equal(result.offset, 0);
});

test('parsePagination custom values', () => {
  const result = parsePagination({ page: '3', limit: '10' });
  assert.equal(result.page, 3);
  assert.equal(result.limit, 10);
  assert.equal(result.offset, 20);
});

test('parsePagination caps limit at 100', () => {
  const result = parsePagination({ limit: '500' });
  assert.equal(result.limit, 100);
});

test('health endpoint shape', async () => {
  const res = await fetch('http://localhost:5000/health').catch(() => null);
  if (!res) {
    console.log('Skipping health test — server not running');
    return;
  }
  const body = await res.json();
  assert.ok('success' in body);
  assert.ok('message' in body);
});
