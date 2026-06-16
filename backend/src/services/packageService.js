import { query, queryOne } from '../config/database.js';

export async function listPackages(activeOnly = false) {
  let sql = 'SELECT * FROM packages';
  if (activeOnly) sql += ' WHERE is_active = 1';
  sql += ' ORDER BY sort_order';
  const packages = await query(sql);
  return packages.map((p) => ({
    ...p,
    features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
  }));
}

export async function getPackage(id) {
  const pkg = await queryOne('SELECT * FROM packages WHERE id = ?', [id]);
  if (!pkg) return null;
  return {
    ...pkg,
    features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features,
  };
}

export async function createPackage(data) {
  const result = await query(
    `INSERT INTO packages (code, name, description, college_limit, price, features, is_active, is_featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code,
      data.name,
      data.description,
      data.college_limit,
      data.price,
      JSON.stringify(data.features || []),
      data.is_active !== false ? 1 : 0,
      data.is_featured ? 1 : 0,
      data.sort_order || 0,
    ]
  );
  return getPackage(result.insertId);
}

export async function updatePackage(id, data) {
  const fields = [];
  const params = [];
  ['code', 'name', 'description', 'college_limit', 'price', 'sort_order'].forEach((k) => {
    if (data[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(data[k]);
    }
  });
  if (data.features) {
    fields.push('features = ?');
    params.push(JSON.stringify(data.features));
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    params.push(data.is_active ? 1 : 0);
  }
  if (data.is_featured !== undefined) {
    fields.push('is_featured = ?');
    params.push(data.is_featured ? 1 : 0);
  }
  if (fields.length) {
    params.push(id);
    await query(`UPDATE packages SET ${fields.join(', ')} WHERE id = ?`, params);
  }
  return getPackage(id);
}

export async function deletePackage(id) {
  const [used] = await query('SELECT COUNT(*) as c FROM students WHERE package_id = ?', [id]);
  if (used.c > 0) {
    throw Object.assign(new Error('Cannot delete package assigned to students'), { status: 400 });
  }
  await query('DELETE FROM packages WHERE id = ?', [id]);
}
