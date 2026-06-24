function parseJson(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

function normalizeStudent(student) {
  const academic = parseJson(student.academic_details) || {};
  const targetCountries = parseJson(student.target_countries) || [];
  const targetPrograms = parseJson(student.target_programs) || [];
  const workExp = parseJson(student.work_experience) || {};

  return {
    city: (student.city || '').toLowerCase(),
    state: (student.state || '').toLowerCase(),
    career_goal: (student.career_goal || '').toLowerCase(),
    target_countries: Array.isArray(targetCountries) ? targetCountries.map((c) => String(c).toLowerCase()) : [],
    target_programs: Array.isArray(targetPrograms) ? targetPrograms.map((p) => String(p).toLowerCase()) : [],
    preferred_budget_max: student.preferred_budget_max ? Number(student.preferred_budget_max) : null,
    gmat: academic.gmat ? Number(academic.gmat) : null,
    cat_percentile: academic.cat_percentile ? Number(academic.cat_percentile) : null,
    graduation_score: academic.graduation_score ? Number(academic.graduation_score) : null,
    work_experience_years: workExp.years ? Number(workExp.years) : academic.work_experience_years ? Number(academic.work_experience_years) : null,
  };
}

function scoreLocation(student, college) {
  const collegeState = (college.state || '').toLowerCase();
  const collegeCity = (college.city || '').toLowerCase();
  const country = (college.country || college.state || 'india').toLowerCase();

  if (student.city && student.city === collegeCity) {
    return { score: 20, max: 20, detail: `Same city as you (${college.city})` };
  }
  if (student.state && student.state === collegeState) {
    return { score: 16, max: 20, detail: `Located in your state (${college.state})` };
  }
  if (student.target_countries.length > 0) {
    const match = student.target_countries.some((c) => country.includes(c) || c.includes(country));
    if (match) return { score: 14, max: 20, detail: 'Matches your target country preference' };
    return { score: 6, max: 20, detail: 'Outside your preferred countries' };
  }
  return { score: 10, max: 20, detail: 'National program — add target countries to refine match' };
}

function scoreBudget(student, college) {
  const fees = Number(college.fees_min || college.fees_max || 0);
  if (!fees) return { score: 10, max: 15, detail: 'Tuition data unavailable' };

  if (student.preferred_budget_max) {
    if (fees <= student.preferred_budget_max) {
      return { score: 15, max: 15, detail: `Within your budget of ₹${student.preferred_budget_max.toLocaleString('en-IN')}` };
    }
    const overPct = ((fees - student.preferred_budget_max) / student.preferred_budget_max) * 100;
    if (overPct <= 15) return { score: 11, max: 15, detail: 'Slightly above budget but potentially manageable' };
    if (overPct <= 35) return { score: 7, max: 15, detail: 'Above your stated budget' };
    return { score: 3, max: 15, detail: 'Significantly above your budget' };
  }
  return { score: 9, max: 15, detail: 'Add a budget preference to improve budget matching' };
}

function scoreExams(student, college) {
  const exams = parseJson(college.accepted_exams) || [];
  const examList = Array.isArray(exams) ? exams.map((e) => String(e).toUpperCase()) : [];

  if (!student.gmat && !student.cat_percentile) {
    return { score: 8, max: 25, detail: 'Add GMAT/CAT scores to your profile for exam fit' };
  }

  let score = 0;
  const details = [];

  if (student.gmat && examList.some((e) => e.includes('GMAT'))) {
    if (student.gmat >= 720) score += 25;
    else if (student.gmat >= 680) score += 20;
    else if (student.gmat >= 640) score += 14;
    else score += 8;
    details.push(`GMAT ${student.gmat} vs accepted exams`);
  } else if (student.cat_percentile && examList.some((e) => e.includes('CAT'))) {
    if (student.cat_percentile >= 99) score += 25;
    else if (student.cat_percentile >= 95) score += 20;
    else if (student.cat_percentile >= 90) score += 14;
    else score += 8;
    details.push(`CAT ${student.cat_percentile} percentile alignment`);
  } else {
    score = 10;
    details.push('Exam requirements may differ from your profile');
  }

  return { score: Math.min(25, score), max: 25, detail: details.join(' · ') };
}

function scoreRanking(college) {
  const rank = Number(college.ranking) || 100;
  if (rank <= 10) return { score: 20, max: 20, detail: `Top-tier institute — Rank #${rank}` };
  if (rank <= 25) return { score: 17, max: 20, detail: `Highly ranked — Rank #${rank}` };
  if (rank <= 50) return { score: 14, max: 20, detail: `Strong ranking — Rank #${rank}` };
  if (rank <= 100) return { score: 10, max: 20, detail: `Rank #${rank}` };
  return { score: 6, max: 20, detail: `Rank #${rank}` };
}

function scoreCareer(student, college, specializations = []) {
  const specs = specializations.length
    ? specializations.map((s) => (typeof s === 'string' ? s : s.name || '').toLowerCase())
    : (college.specializations || []).map((s) => String(s).toLowerCase());

  const goal = student.career_goal;
  const targets = student.target_programs;

  if (!goal && targets.length === 0) {
    return { score: 8, max: 20, detail: 'Add career goals to see program alignment' };
  }

  let best = 0;
  let matched = '';

  for (const spec of specs) {
    let local = 0;
    if (goal && spec.includes(goal)) local += 12;
    if (goal && goal.includes(spec.split(' ')[0])) local += 8;
    for (const t of targets) {
      if (spec.includes(t) || t.includes(spec)) local += 10;
    }
    if (local > best) {
      best = local;
      matched = spec;
    }
  }

  if (best === 0 && goal) {
    const keywords = ['finance', 'marketing', 'hr', 'operations', 'analytics', 'consulting'];
    for (const kw of keywords) {
      if (goal.includes(kw) && specs.some((s) => s.includes(kw))) {
        best = 14;
        matched = kw;
        break;
      }
    }
  }

  const score = Math.min(20, best || 6);
  return {
    score,
    max: 20,
    detail: matched ? `Aligns with ${matched} specialization` : 'Limited specialization overlap with your goals',
  };
}

function getLabel(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  return 'Explore';
}

export function computeUniversityMatch(student, college, specializations = []) {
  const s = normalizeStudent(student);
  const factors = [
    { key: 'location', label: 'Location Match', ...scoreLocation(s, college) },
    { key: 'budget', label: 'Budget Match', ...scoreBudget(s, college) },
    { key: 'exams', label: 'Exam Match', ...scoreExams(s, college) },
    { key: 'ranking', label: 'Ranking Match', ...scoreRanking(college) },
    { key: 'career', label: 'Career Goal Match', ...scoreCareer(s, college, specializations) },
  ];

  const score = Math.min(99, Math.round(factors.reduce((sum, f) => sum + f.score, 0)));

  return {
    score,
    label: getLabel(score),
    factors,
    recommendations: buildRecommendations(factors, s),
  };
}

function buildRecommendations(factors, student) {
  const recs = [];
  for (const f of factors) {
    const pct = f.max ? f.score / f.max : 0;
    if (pct < 0.6) {
      if (f.key === 'budget') recs.push('Update your budget preference or explore scholarship options.');
      if (f.key === 'exams') recs.push('Add GMAT/CAT scores to improve exam matching.');
      if (f.key === 'career') recs.push('Set career goals and target programs in your profile.');
      if (f.key === 'location') recs.push('Add target countries to refine location recommendations.');
    }
  }
  if (!student.preferred_budget_max) recs.push('Complete your budget preference for better recommendations.');
  return [...new Set(recs)].slice(0, 3);
}

export function computeProgramMatch(student, program, college) {
  const universityMatch = computeUniversityMatch(student, college, [program.program_name || program.name]);
  const goal = (student.career_goal || '').toLowerCase();
  const programName = (program.program_name || program.name || '').toLowerCase();

  let programBoost = 6;
  if (goal && programName.includes(goal)) programBoost = 18;
  else if (goal && goal.split(' ').some((w) => w.length > 3 && programName.includes(w))) programBoost = 12;

  const score = Math.min(99, Math.round(universityMatch.score * 0.6 + programBoost));
  return {
    score,
    label: getLabel(score),
    factors: universityMatch.factors,
    recommendations: universityMatch.recommendations,
  };
}

export function computeCompareWinners(universities) {
  if (!universities?.length) return {};

  const byRanking = [...universities].sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[0];
  const byMatch = [...universities].sort((a, b) => (b.match?.score || b.match_score || 0) - (a.match?.score || a.match_score || 0))[0];
  const byRoi = [...universities].sort((a, b) => {
    const roiA = (Number(a.avg_package) || 0) / (Number(a.fees_min) || 1);
    const roiB = (Number(b.avg_package) || 0) / (Number(b.fees_min) || 1);
    return roiB - roiA;
  })[0];
  const byPlacement = [...universities].sort(
    (a, b) => (Number(b.avg_package) || 0) - (Number(a.avg_package) || 0)
  )[0];

  return {
    ranking: byRanking?.id,
    match_score: byMatch?.id,
    roi: byRoi?.id,
    placement: byPlacement?.id,
  };
}
