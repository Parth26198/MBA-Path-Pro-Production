import { query, queryOne } from '../config/database.js';
import { computeUniversityMatch, computeProgramMatch } from './matchScoreService.js';
import * as collegeService from './collegeService.js';
import { getSavedIds } from './savedUniversityService.js';

async function getStudentRow(studentId) {
  return queryOne(
    `SELECT s.*, u.name, u.email, u.phone FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [studentId]
  );
}

export async function getRecommendedUniversities(studentId, limit = 8) {
  const student = await getStudentRow(studentId);
  const savedIds = await getSavedIds(studentId);

  const colleges = await query(
    `SELECT c.* FROM colleges c
     WHERE c.status = 'published'
       AND c.id NOT IN (SELECT college_id FROM applications WHERE student_id = ?)
     ORDER BY c.is_featured DESC, c.ranking ASC
     LIMIT 60`,
    [studentId]
  );

  const scored = await Promise.all(
    colleges.map(async (row) => {
      const college = await collegeService.getCollegeById(row.id);
      const match = computeUniversityMatch(student, college, college.specializations);
      let score = match.score;
      if (college.is_featured) score = Math.min(99, score + 5);
      if (savedIds.has(college.id)) score = Math.min(99, score + 3);

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
        is_saved: savedIds.has(college.id),
        match_score: score,
        match: { ...match, score },
      };
    })
  );

  scored.sort((a, b) => b.match_score - a.match_score);
  const filtered = scored.filter((c) => c.match_score >= 55);
  return (filtered.length >= 4 ? filtered : scored).slice(0, limit);
}

export async function getRecommendedPrograms(studentId, limit = 10) {
  const student = await getStudentRow(studentId);

  const rows = await query(
    `SELECT cs.id as specialization_id, cs.name as program_name, c.id as college_id, c.name as university_name,
            c.slug, c.location, c.ranking, c.fees_min, c.fees_max, c.eligibility, c.accepted_exams, c.state
     FROM college_specializations cs
     JOIN colleges c ON cs.college_id = c.id
     WHERE c.status = 'published'
     ORDER BY c.ranking ASC
     LIMIT 80`
  );

  const scored = rows.map((r) => {
    const college = {
      id: r.college_id,
      name: r.university_name,
      ranking: r.ranking,
      fees_min: r.fees_min,
      fees_max: r.fees_max,
      accepted_exams: typeof r.accepted_exams === 'string' ? JSON.parse(r.accepted_exams || '[]') : r.accepted_exams,
      specializations: [r.program_name],
      state: r.state,
    };
    const match = computeProgramMatch(student, r, college);
    return {
      id: r.specialization_id,
      program_name: r.program_name,
      college_id: r.college_id,
      university_name: r.university_name,
      slug: r.slug,
      location: r.location,
      ranking: r.ranking,
      fees_min: r.fees_min,
      fees_max: r.fees_max,
      eligibility: r.eligibility,
      country: r.state || 'India',
      duration: '2 years',
      format: 'Full-time',
      match_score: match.score,
      match,
      accepted_exams: college.accepted_exams || [],
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  const diverse = [];
  const perCollege = {};
  for (const p of scored) {
    const count = perCollege[p.college_id] || 0;
    if (count >= 2) continue;
    perCollege[p.college_id] = count + 1;
    diverse.push(p);
    if (diverse.length >= limit) break;
  }

  return diverse;
}

export async function getSimilarUniversities(studentId, collegeId, limit = 4) {
  const student = await getStudentRow(studentId);
  const base = await collegeService.getCollegeById(collegeId);
  if (!base) return [];

  const colleges = await query(
    `SELECT * FROM colleges WHERE status = 'published' AND id != ? ORDER BY ABS(ranking - ?) ASC LIMIT 12`,
    [collegeId, base.ranking || 50]
  );

  const scored = await Promise.all(
    colleges.map(async (row) => {
      const college = await collegeService.getCollegeById(row.id);
      const match = computeUniversityMatch(student, college, college.specializations);
      return {
        id: college.id,
        name: college.name,
        slug: college.slug,
        cover_banner_url: college.cover_banner_url,
        ranking: college.ranking,
        match_score: match.score,
        match,
      };
    })
  );

  return scored.sort((a, b) => b.match_score - a.match_score).slice(0, limit);
}
