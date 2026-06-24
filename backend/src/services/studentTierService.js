export function isPremiumStudent(student) {
  if (!student) return false;
  return (
    student.payment_status === 'completed' &&
    Number(student.colleges_allowed) > 0 &&
    student.package_id != null
  );
}

export function canApplyToColleges(student) {
  if (!isPremiumStudent(student)) return false;
  return Number(student.colleges_applied || 0) < Number(student.colleges_allowed || 0);
}

export function getTierMeta(student) {
  const isPremium = isPremiumStudent(student);
  const collegesAllowed = Number(student?.colleges_allowed || 0);
  const collegesApplied = Number(student?.colleges_applied || 0);
  const collegesRemaining = Math.max(0, collegesAllowed - collegesApplied);

  return {
    tier: isPremium ? 'premium' : 'free',
    is_premium: isPremium,
    can_apply: canApplyToColleges(student),
    colleges_remaining: collegesRemaining,
    upgrade_required: !isPremium,
  };
}

export function assertCanApply(student) {
  if (!isPremiumStudent(student)) {
    const err = new Error('Upgrade to a premium package to apply to colleges');
    err.status = 403;
    err.code = 'PAYMENT_REQUIRED';
    throw err;
  }
  if (Number(student.colleges_applied || 0) >= Number(student.colleges_allowed || 0)) {
    const err = new Error('College application limit reached for your package');
    err.status = 400;
    err.code = 'LIMIT_REACHED';
    throw err;
  }
}
