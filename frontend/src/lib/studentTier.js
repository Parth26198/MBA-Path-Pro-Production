export function isPremium(profile) {
  if (!profile) return false;
  return profile.is_premium === true || profile.tier === 'premium';
}

export function canApply(profile) {
  if (!profile) return false;
  return profile.can_apply === true;
}

export function getTierLabel(profile) {
  return isPremium(profile) ? 'Premium' : 'Free';
}

export function collegesRemaining(profile) {
  return profile?.colleges_remaining ?? 0;
}
