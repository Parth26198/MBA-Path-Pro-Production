import { query, queryOne } from '../config/database.js';
import { slugify } from '../utils/slugify.js';
import { sqlVal } from '../utils/sql.js';

export async function getCollegeById(id, includeDraft = false) {
  const college = await queryOne('SELECT * FROM colleges WHERE id = ?', [id]);
  if (!college) return null;
  if (!includeDraft && college.status !== 'published') return null;
  return enrichCollege(college);
}

export async function getCollegeBySlug(slug) {
  const college = await queryOne("SELECT * FROM colleges WHERE slug = ? AND status = 'published'", [slug]);
  if (!college) return null;
  return enrichCollege(college);
}

async function enrichCollege(college) {
  const specializations = await query('SELECT name FROM college_specializations WHERE college_id = ?', [college.id]);
  const gallery = await query('SELECT * FROM college_gallery WHERE college_id = ? ORDER BY sort_order', [college.id]);
  return {
    ...college,
    accepted_exams: parseJson(college.accepted_exams),
    deadlines: parseJson(college.deadlines),
    specializations: specializations.map((s) => s.name),
    gallery,
  };
}

function parseJson(val) {
  if (!val) return [];
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export async function listColleges({ status, featured, search, limit = 50, trainerId = null } = {}) {
  let sql = 'SELECT * FROM colleges WHERE 1=1';
  const params = [];

  if (trainerId) {
    sql += ' AND created_by_trainer_id = ?';
    params.push(trainerId);
  }

  if (status === 'all') {
    // no status filter
  } else if (status) {
    sql += ' AND status = ?';
    params.push(status);
  } else {
    sql += " AND status = 'published'";
  }
  if (featured) {
    sql += ' AND is_featured = 1';
  }
  if (search) {
    sql += ' AND (name LIKE ? OR location LIKE ? OR city LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  sql += ` ORDER BY ranking ASC, name ASC LIMIT ${safeLimit}`;

  const colleges = await query(sql, params);
  return Promise.all(colleges.map(enrichCollege));
}

export async function assertTrainerOwnsCollege(trainerId, collegeId) {
  const college = await queryOne('SELECT * FROM colleges WHERE id = ?', [collegeId]);
  if (!college) throw Object.assign(new Error('College not found'), { status: 404 });
  if (college.created_by_trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only manage colleges you created'), { status: 403 });
  }
  return college;
}

export async function createCollege(data, trainerId = null) {
  const slug = data.slug || slugify(data.name);
  const status = data.status || (trainerId ? 'draft' : 'published');
  const result = await query(
    `INSERT INTO colleges (name, slug, logo_url, cover_banner_url, description, location, city, state,
      ranking, fees_min, fees_max, avg_package, highest_package, eligibility, accepted_exams, deadlines,
      admission_process, website, contact_email, contact_phone, status, is_featured, created_by_trainer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      slug,
      sqlVal(data.logo_url),
      sqlVal(data.cover_banner_url),
      sqlVal(data.description),
      sqlVal(data.location),
      sqlVal(data.city),
      sqlVal(data.state),
      sqlVal(data.ranking),
      sqlVal(data.fees_min),
      sqlVal(data.fees_max),
      sqlVal(data.avg_package),
      sqlVal(data.highest_package),
      sqlVal(data.eligibility),
      JSON.stringify(data.accepted_exams || []),
      JSON.stringify(data.deadlines || {}),
      sqlVal(data.admission_process),
      sqlVal(data.website),
      sqlVal(data.contact_email),
      sqlVal(data.contact_phone),
      status,
      data.is_featured ? 1 : 0,
      trainerId,
    ]
  );

  const collegeId = result.insertId;
  await saveSpecializations(collegeId, data.specializations);
  await saveGallery(collegeId, data.gallery);
  return getCollegeById(collegeId, true);
}

export async function updateCollege(id, data, { trainerId = null } = {}) {
  if (trainerId) {
    await assertTrainerOwnsCollege(trainerId, id);
    const trainerAllowed = ['draft', 'pending_approval', 'archived'];
    if (data.status && !trainerAllowed.includes(data.status)) {
      throw Object.assign(new Error('Trainers cannot set this status. Submit for approval instead.'), { status: 403 });
    }
  }

  const fields = [];
  const params = [];
  const allowed = [
    'name', 'logo_url', 'cover_banner_url', 'description', 'location', 'city', 'state',
    'ranking', 'fees_min', 'fees_max', 'avg_package', 'highest_package', 'eligibility',
    'admission_process', 'website', 'contact_email', 'contact_phone', 'status', 'is_featured',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(key === 'is_featured' ? (data[key] ? 1 : 0) : sqlVal(data[key]));
    }
  }
  if (data.accepted_exams !== undefined) {
    fields.push('accepted_exams = ?');
    params.push(JSON.stringify(data.accepted_exams || []));
  }
  if (data.deadlines !== undefined) {
    fields.push('deadlines = ?');
    params.push(JSON.stringify(data.deadlines || {}));
  }

  if (fields.length) {
    params.push(id);
    await query(`UPDATE colleges SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  if (data.specializations !== undefined) await saveSpecializations(id, data.specializations);
  if (data.gallery !== undefined) {
    await query('DELETE FROM college_gallery WHERE college_id = ?', [id]);
    await saveGallery(id, data.gallery);
  }

  return getCollegeById(id, true);
}

export async function deleteCollege(id, { trainerId = null } = {}) {
  if (trainerId) {
    const college = await assertTrainerOwnsCollege(trainerId, id);
    if (!['draft', 'archived', 'rejected'].includes(college.status)) {
      throw Object.assign(new Error('Only draft, archived, or rejected colleges can be deleted'), { status: 400 });
    }
  }
  await query('DELETE FROM colleges WHERE id = ?', [id]);
}

export async function submitCollegeForApproval(id, trainerId) {
  await assertTrainerOwnsCollege(trainerId, id);
  await query("UPDATE colleges SET status = 'pending_approval' WHERE id = ?", [id]);
  return getCollegeById(id, true);
}

async function saveSpecializations(collegeId, specs) {
  await query('DELETE FROM college_specializations WHERE college_id = ?', [collegeId]);
  if (!specs?.length) return;
  for (const name of specs) {
    if (name?.trim()) {
      await query('INSERT INTO college_specializations (college_id, name) VALUES (?, ?)', [collegeId, name.trim()]);
    }
  }
}

async function saveGallery(collegeId, gallery) {
  if (!gallery?.length) return;
  let order = 0;
  for (const img of gallery) {
    await query(
      'INSERT INTO college_gallery (college_id, image_url, caption, sort_order) VALUES (?, ?, ?, ?)',
      [collegeId, img.image_url || img, sqlVal(img.caption, ''), order++]
    );
  }
}
