import { query, queryOne } from '../config/database.js';
import { computeUniversityMatch } from './matchScoreService.js';
import * as collegeService from './collegeService.js';

async function getStudentRow(studentId) {
  return queryOne(
    `SELECT s.*, u.name, u.email, u.phone FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [studentId]
  );
}

function mapCollegeWithMatch(student, college, isSaved = true) {
  const match = computeUniversityMatch(student, college, college.specializations);
  return {
    id: college.id,
    name: college.name,
    slug: college.slug,
    logo_url: college.logo_url,
    cover_banner_url: college.cover_banner_url,
    location: college.location,
    city: college.city,
    state: college.state,
    country: college.state || 'India',
    ranking: college.ranking,
    fees_min: college.fees_min,
    fees_max: college.fees_max,
    avg_package: college.avg_package,
    program_count: college.specializations?.length || 0,
    is_saved: isSaved,
    match_score: match.score,
    match,
  };
}

export async function listSaved(studentId) {
  const student = await getStudentRow(studentId);
  const rows = await query(
    `SELECT c.* FROM saved_universities su
     JOIN colleges c ON su.college_id = c.id
     WHERE su.student_id = ? AND c.status = 'published'
     ORDER BY su.created_at DESC`,
    [studentId]
  );

  return Promise.all(
    rows.map(async (row) => {
      const college = await collegeService.getCollegeById(row.id);
      return mapCollegeWithMatch(student, college, true);
    })
  );
}

export async function getSavedForDashboard(studentId, limit = 6) {
  const all = await listSaved(studentId);
  return all.slice(0, limit);
}

export async function saveUniversity(studentId, collegeId) {
  const college = await queryOne("SELECT id FROM colleges WHERE id = ? AND status = 'published'", [collegeId]);
  if (!college) throw Object.assign(new Error('University not found'), { status: 404 });

  await query(
    `INSERT INTO saved_universities (student_id, college_id) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE created_at = created_at`,
    [studentId, collegeId]
  );
  return { saved: true, college_id: collegeId };
}

export async function unsaveUniversity(studentId, collegeId) {
  await query('DELETE FROM saved_universities WHERE student_id = ? AND college_id = ?', [studentId, collegeId]);
  return { saved: false, college_id: collegeId };
}

export async function isSaved(studentId, collegeId) {
  const row = await queryOne(
    'SELECT id FROM saved_universities WHERE student_id = ? AND college_id = ?',
    [studentId, collegeId]
  );
  return !!row;
}

export async function getSavedIds(studentId) {
  const rows = await query('SELECT college_id FROM saved_universities WHERE student_id = ?', [studentId]);
  return new Set(rows.map((r) => r.college_id));
}
