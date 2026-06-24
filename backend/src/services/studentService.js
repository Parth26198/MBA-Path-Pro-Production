import { query, queryOne } from '../config/database.js';
import * as applicationService from './applicationService.js';
import * as subscriptionService from './subscriptionService.js';
import { getTierMeta } from './studentTierService.js';
import * as packageService from './packageService.js';
import * as collegeService from './collegeService.js';
import { computeUniversityMatch, computeProgramMatch, computeCompareWinners } from './matchScoreService.js';
import * as recommendationService from './recommendationService.js';
import * as savedUniversityService from './savedUniversityService.js';
import { normalizeOnboardingStep } from '../utils/onboarding.js';

const STATIC_RESOURCES = [
  { id: 'sop', title: 'SOP Writing Guide', type: 'guide', is_premium: false },
  { id: 'resume', title: 'MBA Resume Template', type: 'template', is_premium: false },
  { id: 'interview', title: 'Interview Preparation Kit', type: 'guide', is_premium: true },
  { id: 'gmat', title: 'GMAT Strategy Playbook', type: 'guide', is_premium: true },
  { id: 'lor', title: 'LOR Request Template', type: 'template', is_premium: true },
];

function computeJourneyProgress(student, applications, profileCompletion) {
  const steps = [
    { id: 'profile', label: 'Complete Profile', done: (profileCompletion?.percent || 0) >= 80 },
    { id: 'explore', label: 'Explore Universities', done: true },
    { id: 'package', label: 'Choose Package', done: student.payment_status === 'completed' },
    { id: 'apply', label: 'Submit Applications', done: (applications?.length || 0) > 0 },
    {
      id: 'admit',
      label: 'Get Admitted',
      done: applications?.some((a) => a.status === 'Admitted'),
    },
  ];
  const completed = steps.filter((s) => s.done).length;
  return {
    percent: Math.round((completed / steps.length) * 100),
    steps,
    current_step: steps.find((s) => !s.done) || steps[steps.length - 1],
  };
}

function buildHeroContent(student, tier, journey) {
  if (!tier.is_premium) {
    return {
      headline: 'Your MBA Journey Starts Here',
      subheadline: 'Explore top universities, compare programs, and upgrade when you are ready to apply.',
      primary_cta: { label: 'Explore Universities', path: '/student/universities' },
      secondary_cta: { label: 'View Programs', path: '/student/programs' },
    };
  }
  if ((student.colleges_applied || 0) === 0) {
    return {
      headline: 'Ready to Apply?',
      subheadline: `Your ${student.package_name} plan includes ${student.colleges_allowed} college applications.`,
      primary_cta: { label: 'Browse Universities', path: '/student/universities' },
      secondary_cta: { label: 'Track Applications', path: '/student/applications' },
    };
  }
  return {
    headline: `Welcome back, ${student.name?.split(' ')[0] || 'Student'}`,
    subheadline: `You are ${journey.percent}% through your MBA journey. Keep momentum going.`,
    primary_cta: { label: 'View Applications', path: '/student/applications' },
    secondary_cta: { label: 'Book Mentor Session', path: '/student/mentors' },
  };
}

function buildAdmissionTimeline(student, applications) {
  const events = [];

  events.push({
    id: 'profile-created',
    stage: 'Profile Created',
    title: 'Profile Created',
    description: 'Your MBA Path Pro account was created.',
    status: 'completed',
    at: student.created_at || student.enrollment_date,
  });

  if (student.payment_status === 'completed') {
    events.push({
      id: 'package-activated',
      stage: 'Package Activated',
      title: 'Package Activated',
      description: student.package_name ? `${student.package_name} is active.` : 'Premium package activated.',
      status: 'completed',
      at: student.updated_at,
    });
  } else {
    events.push({
      id: 'package-activated',
      stage: 'Package Activated',
      title: 'Package Activated',
      description: 'Upgrade to unlock college applications.',
      status: 'pending',
    });
  }

  for (const app of applications) {
    events.push({
      id: `app-submitted-${app.id}`,
      stage: 'Application Submitted',
      title: `Applied to ${app.college_name}`,
      description: `Application status: ${app.status}`,
      status: 'completed',
      at: app.submitted_at || app.created_at,
      application_id: app.id,
    });

    if (['Under Review', 'Documents Pending'].includes(app.status)) {
      events.push({
        id: `app-review-${app.id}`,
        stage: 'Application Reviewed',
        title: `${app.college_name} under review`,
        status: 'current',
        at: app.updated_at,
        application_id: app.id,
      });
    }
    if (['Interview Scheduled', 'GDPI Preparation'].includes(app.status)) {
      events.push({
        id: `app-interview-${app.id}`,
        stage: 'Interview Scheduled',
        title: `Interview stage — ${app.college_name}`,
        status: 'current',
        at: app.updated_at,
        application_id: app.id,
      });
    }
    if (app.status === 'Admitted') {
      events.push({
        id: `app-offer-${app.id}`,
        stage: 'Offer Received',
        title: `Offer from ${app.college_name}`,
        status: 'completed',
        at: app.updated_at,
        application_id: app.id,
      });
      events.push({
        id: `app-admit-${app.id}`,
        stage: 'Admission Confirmed',
        title: `Admitted to ${app.college_name}`,
        status: 'completed',
        at: app.updated_at,
        application_id: app.id,
      });
    }
  }

  return events.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
}

async function getStudentRow(studentId) {
  return queryOne(
    `SELECT s.*, u.name, u.email, u.phone FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [studentId]
  );
}

function mapUniversityListItem(student, college, savedIds) {
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
    eligibility: college.eligibility,
    accepted_exams: college.accepted_exams,
    specializations: college.specializations,
    program_count: college.specializations?.length || 0,
    is_saved: savedIds.has(college.id),
    match_score: match.score,
    match,
  };
}

export async function getStudentDashboard(studentId) {
  const student = await queryOne(
    `SELECT s.*, u.name, u.email, p.name as package_name, p.code as package_code, p.college_limit, p.price,
            tu.name as trainer_name, tu.email as trainer_email, tu.phone as trainer_phone, t.id as trainer_record_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     LEFT JOIN trainers t ON s.trainer_id = t.id
     LEFT JOIN users tu ON t.user_id = u.id
     WHERE s.id = ?`,
    [studentId]
  );

  const applications = await applicationService.getApplicationsForStudent(studentId);
  const preparationTasks = await query(
    'SELECT * FROM preparation_tasks WHERE student_id = ? ORDER BY created_at DESC',
    [studentId]
  );
  const sessions = await query(
    `SELECT ts.*, u.name as trainer_name FROM trainer_sessions ts
     JOIN trainers t ON ts.trainer_id = t.id
     JOIN users u ON t.user_id = u.id
     WHERE ts.student_id = ? ORDER BY ts.scheduled_at DESC LIMIT 10`,
    [studentId]
  );
  const notifications = await query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [student.user_id]
  );
  const documents = await query(
    'SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC',
    [studentId]
  );

  const tier = getTierMeta(student);
  const subscription = await subscriptionService.getSubscriptionSummary(studentId);
  const profileCompletion = computeProfileCompletion(student);
  const recommendedColleges = await recommendationService.getRecommendedUniversities(studentId, 8);
  const recommendedPrograms = await recommendationService.getRecommendedPrograms(studentId, 6);
  const savedUniversities = await savedUniversityService.getSavedForDashboard(studentId, 6);
  const applicationStats = computeApplicationStats(applications);
  const journey = computeJourneyProgress(student, applications, profileCompletion);
  const hero = buildHeroContent(student, tier, journey);
  const packages = await packageService.listPackages(true);
  const admissionTimeline = buildAdmissionTimeline(student, applications);

  return {
    student: {
      ...student,
      ...tier,
      colleges_remaining: Math.max(0, (student.colleges_allowed || 0) - (student.colleges_applied || 0)),
      subscription: subscription.subscription,
      profile_completion: profileCompletion,
    },
    hero,
    journey,
    savedUniversities,
    recommendedColleges,
    recommendedPrograms,
    applicationStats,
    admissionTimeline,
    resources: STATIC_RESOURCES,
    packages,
    applications,
    preparationTasks,
    sessions,
    notifications,
    documents,
  };
}

function computeProfileCompletion(student) {
  const academic = parseJsonField(student.academic_details);
  const checks = [
    { key: 'name', label: 'Full name', done: !!student.name },
    { key: 'email', label: 'Email address', done: !!student.email },
    { key: 'phone', label: 'Phone number', done: !!student.phone },
    { key: 'city', label: 'City', done: !!student.city },
    { key: 'career_goal', label: 'Career goal', done: !!student.career_goal },
    { key: 'target_countries', label: 'Target countries', done: !!student.target_countries },
    { key: 'gmat', label: 'GMAT / CAT scores', done: !!(academic?.gmat || academic?.cat_percentile) },
    { key: 'budget', label: 'Budget preference', done: !!student.preferred_budget_max },
  ];
  const done = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.done).map((c) => c.label),
    checks,
  };
}

function computeApplicationStats(applications) {
  const buckets = { applied: 0, in_review: 0, interview: 0, accepted: 0, rejected: 0 };
  for (const app of applications) {
    const s = app.status;
    if (s === 'Admitted') buckets.accepted++;
    else if (s === 'Rejected' || s === 'Withdrawn') buckets.rejected++;
    else if (s === 'Interview Scheduled' || s === 'GDPI Preparation') buckets.interview++;
    else if (s === 'Under Review' || s === 'Documents Pending') buckets.in_review++;
    else buckets.applied++;
  }
  return buckets;
}

export async function listStudentUniversities(studentId, filters = {}) {
  const student = await getStudentRow(studentId);
  const savedIds = await savedUniversityService.getSavedIds(studentId);

  if (filters.ids) {
    const ids = String(filters.ids)
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter(Boolean);
    const items = await Promise.all(
      ids.map(async (id) => {
        const college = await collegeService.getCollegeById(id);
        if (!college) return null;
        return mapUniversityListItem(student, college, savedIds);
      })
    );
    return items.filter(Boolean);
  }

  const colleges = await collegeService.listColleges({
    status: 'published',
    search: filters.search,
    limit: filters.limit || 50,
  });

  return colleges.map((c) => mapUniversityListItem(student, c, savedIds));
}

export async function getUniversityDetail(studentId, slug) {
  const student = await getStudentRow(studentId);
  const college = await collegeService.getCollegeBySlug(slug);
  if (!college) throw Object.assign(new Error('University not found'), { status: 404 });

  const match = computeUniversityMatch(student, college, college.specializations);
  const is_saved = await savedUniversityService.isSaved(studentId, college.id);
  const similar = await recommendationService.getSimilarUniversities(studentId, college.id, 4);

  const programs = (college.specializations || []).map((name) => {
    const programMatch = computeProgramMatch(student, { program_name: name }, college);
    return { name, match_score: programMatch.score, match: programMatch };
  });

  return {
    ...college,
    country: college.state || 'India',
    is_saved,
    match,
    match_score: match.score,
    programs,
    similar,
    decision_center: {
      headline: 'Why this university matches you',
      factors: match.factors,
      recommendations: match.recommendations,
    },
  };
}

export async function compareUniversities(studentId, ids) {
  const universities = await listStudentUniversities(studentId, { ids: ids.join(',') });
  return {
    universities,
    winners: computeCompareWinners(universities),
  };
}

export async function listStudentPrograms(studentId, filters = {}) {
  const student = await getStudentRow(studentId);

  let sql = `SELECT cs.id as specialization_id, cs.name as program_name, c.id as college_id, c.name as university_name,
                    c.slug, c.location, c.ranking, c.fees_min, c.fees_max, c.eligibility, c.accepted_exams, c.state
             FROM college_specializations cs
             JOIN colleges c ON cs.college_id = c.id
             WHERE c.status = 'published'`;
  const params = [];

  if (filters.search) {
    sql += ' AND (cs.name LIKE ? OR c.name LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  sql += ' ORDER BY c.ranking ASC, cs.name ASC LIMIT 100';
  const rows = await query(sql, params);

  return rows.map((r) => {
    const college = {
      id: r.college_id,
      ranking: r.ranking,
      fees_min: r.fees_min,
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
}

export async function getStudentProfile(studentId) {
  const student = await queryOne(
    `SELECT s.*, u.name, u.email, u.phone, u.avatar_url,
            p.name as package_name, p.code as package_code
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     WHERE s.id = ?`,
    [studentId]
  );
  if (!student) return null;
  return {
    ...student,
    ...getTierMeta(student),
    profile_completion: computeProfileCompletion(student),
    target_countries: parseJsonField(student.target_countries),
    target_programs: parseJsonField(student.target_programs),
    academic_details: parseJsonField(student.academic_details),
    work_experience: parseJsonField(student.work_experience),
    onboarding_completed: !!student.onboarding_completed,
    onboarding_step: normalizeOnboardingStep(student.onboarding_step),
  };
}

export async function updateStudentProfile(studentId, userId, data) {
  if (data.name || data.phone) {
    await query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?',
      [data.name || null, data.phone || null, userId]
    );
  }

  await query(
    `UPDATE students SET
       city = COALESCE(?, city),
       state = COALESCE(?, state),
       career_goal = COALESCE(?, career_goal),
       target_countries = COALESCE(?, target_countries),
       target_programs = COALESCE(?, target_programs),
       preferred_budget_max = COALESCE(?, preferred_budget_max),
       academic_details = COALESCE(?, academic_details),
       work_experience = COALESCE(?, work_experience),
       onboarding_step = COALESCE(?, onboarding_step),
       onboarding_completed = IF(? IS NOT NULL, ?, onboarding_completed)
     WHERE id = ?`,
    [
      data.city || null,
      data.state || null,
      data.career_goal || null,
      data.target_countries ? JSON.stringify(data.target_countries) : null,
      data.target_programs ? JSON.stringify(data.target_programs) : null,
      data.preferred_budget_max != null ? data.preferred_budget_max : null,
      data.academic_details ? JSON.stringify(data.academic_details) : null,
      data.work_experience ? JSON.stringify(data.work_experience) : null,
      data.onboarding_step != null ? data.onboarding_step : null,
      data.onboarding_completed != null ? (data.onboarding_completed ? 1 : 0) : null,
      data.onboarding_completed != null ? (data.onboarding_completed ? 1 : 0) : null,
      studentId,
    ]
  );

  return getStudentProfile(studentId);
}

function parseJsonField(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

export async function listStudentPackages() {
  return packageService.listPackages(true);
}

export async function getStudentSubscription(studentId) {
  return subscriptionService.getSubscriptionSummary(studentId);
}

export async function getNotifications(userId) {
  return query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
}

export async function markNotificationRead(id, userId) {
  await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}
