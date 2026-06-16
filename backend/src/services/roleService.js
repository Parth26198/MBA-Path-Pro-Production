import { query, queryOne } from '../config/database.js';

const DEFAULT_ROLES = [
  { name: 'ADMIN', description: 'System administrator' },
  { name: 'TRAINER', description: 'MBA admission trainer' },
  { name: 'STUDENT', description: 'MBA aspirant student' },
];

export async function ensureDefaultRoles() {
  for (const role of DEFAULT_ROLES) {
    const existing = await queryOne('SELECT id FROM roles WHERE name = ?', [role.name]);
    if (!existing) {
      await query('INSERT INTO roles (name, description) VALUES (?, ?)', [role.name, role.description]);
    }
  }
}

export async function ensureRole(roleName) {
  await ensureDefaultRoles();
  const role = await queryOne('SELECT id, name FROM roles WHERE name = ?', [roleName]);
  if (!role) {
    throw Object.assign(new Error(`Role ${roleName} could not be initialized`), { status: 500 });
  }
  return role;
}
