/** Premium college card metadata — campus images, badges, placements (INR only) */

import { normalizeAnnualRupees } from '@/lib/utils';

const CAMPUS = {
  iima: 'https://images.unsplash.com/photo-1541339907198-e08756dedf6f?w=900&h=600&fit=crop&q=85',
  iimb: 'https://images.unsplash.com/photo-1523580490184-6bbb2f281fd0?w=900&h=600&fit=crop&q=85',
  iimc: 'https://images.unsplash.com/photo-1562774053-701939374585?w=900&h=600&fit=crop&q=85',
  isb: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=600&fit=crop&q=85',
  xlri: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=600&fit=crop&q=85',
  spjimr: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=600&fit=crop&q=85',
  fms: 'https://images.unsplash.com/photo-1498243693701-69f8a59efe8e?w=900&h=600&fit=crop&q=85',
  mdi: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=600&fit=crop&q=85',
  jbims: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&h=600&fit=crop&q=85',
  iift: 'https://images.unsplash.com/photo-1515187024625-57bc888b4373?w=900&h=600&fit=crop&q=85',
  insead: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&h=600&fit=crop&q=85',
  hec: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop&q=85',
  lbs: 'https://images.unsplash.com/photo-1498243693701-69f8a59efe8e?w=900&h=600&fit=crop&q=85',
  nus: 'https://images.unsplash.com/photo-1525621488861-1a0d0230910c?w=900&h=600&fit=crop&q=85',
  wharton: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&h=600&fit=crop&q=85',
  default: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=600&fit=crop&q=85',
};

const DEFAULT_RECRUITERS = ['McKinsey', 'BCG', 'Google', 'Amazon', 'Microsoft'];

export const FALLBACK_CAMPUS_IMAGE = CAMPUS.default;

export const DEFAULT_COLLEGE_META = {
  id: 'default',
  logo: 'MBA',
  image: FALLBACK_CAMPUS_IMAGE,
  imageBadges: ['AACSB', 'AICTE Approved'],
  recruiters: DEFAULT_RECRUITERS,
  highestPackage: null,
};

export const COLLEGE_CARD_META = {
  'iim-ahmedabad': {
    id: 'iima',
    logo: 'IIM-A',
    image: CAMPUS.iima,
    imageBadges: ['#1 India', 'NIRF Top Ranked', 'AACSB'],
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: 11500000,
  },
  iima: {
    id: 'iima',
    logo: 'IIM-A',
    image: CAMPUS.iima,
    imageBadges: ['#1 India', 'NIRF Top Ranked', 'AACSB'],
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: 11500000,
  },
  'iim-bangalore': {
    id: 'iimb',
    logo: 'IIM-B',
    image: CAMPUS.iimb,
    imageBadges: ['#2 India', 'NIRF Top Ranked', 'AACSB'],
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: 10200000,
  },
  iimb: {
    id: 'iimb',
    logo: 'IIM-B',
    image: CAMPUS.iimb,
    imageBadges: ['#2 India', 'NIRF Top Ranked', 'AACSB'],
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: 10200000,
  },
  'iim-calcutta': {
    id: 'iimc',
    logo: 'IIM-C',
    image: CAMPUS.iimc,
    imageBadges: ['#3 India', 'NIRF Top Ranked', 'AACSB'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Amazon', 'Microsoft'],
    highestPackage: 10800000,
  },
  iimc: {
    id: 'iimc',
    logo: 'IIM-C',
    image: CAMPUS.iimc,
    imageBadges: ['#3 India', 'NIRF Top Ranked', 'AACSB'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Amazon', 'Microsoft'],
    highestPackage: 10800000,
  },
  'isb-hyderabad': {
    id: 'isb',
    logo: 'ISB',
    image: CAMPUS.isb,
    imageBadges: ['#1 Pvt India', 'AACSB', 'EQUIS'],
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: 13000000,
  },
  isb: {
    id: 'isb',
    logo: 'ISB',
    image: CAMPUS.isb,
    imageBadges: ['#1 Pvt India', 'AACSB', 'EQUIS'],
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: 13000000,
  },
  'xlri-jamshedpur': {
    id: 'xlri',
    logo: 'XLRI',
    image: CAMPUS.xlri,
    imageBadges: ['#4 India', 'AACSB', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'HUL', 'Amazon', 'Microsoft'],
    highestPackage: 7800000,
  },
  xlri: {
    id: 'xlri',
    logo: 'XLRI',
    image: CAMPUS.xlri,
    imageBadges: ['#4 India', 'AACSB', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'HUL', 'Amazon', 'Microsoft'],
    highestPackage: 7800000,
  },
  'sp-jain-mumbai': {
    id: 'spjimr',
    logo: 'SPJ',
    image: CAMPUS.spjimr,
    imageBadges: ['Top 10 India', 'AACSB', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Deloitte', 'Amazon', 'Google'],
    highestPackage: 7500000,
  },
  spjimr: {
    id: 'spjimr',
    logo: 'SPJ',
    image: CAMPUS.spjimr,
    imageBadges: ['Top 10 India', 'AACSB', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Deloitte', 'Amazon', 'Google'],
    highestPackage: 7500000,
  },
  'fms-delhi': {
    id: 'fms',
    logo: 'FMS',
    image: CAMPUS.fms,
    imageBadges: ['#6 India', 'DU Affiliated', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Microsoft', 'Amazon'],
    highestPackage: 10000000,
  },
  fms: {
    id: 'fms',
    logo: 'FMS',
    image: CAMPUS.fms,
    imageBadges: ['#6 India', 'DU Affiliated', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Microsoft', 'Amazon'],
    highestPackage: 10000000,
  },
  'mdi-gurgaon': {
    id: 'mdi',
    logo: 'MDI',
    image: CAMPUS.mdi,
    imageBadges: ['Top 10 India', 'AACSB', 'AICTE Approved'],
    recruiters: ['Deloitte', 'KPMG', 'Amazon', 'HUL', 'Microsoft'],
    highestPackage: 6500000,
  },
  mdi: {
    id: 'mdi',
    logo: 'MDI',
    image: CAMPUS.mdi,
    imageBadges: ['Top 10 India', 'AACSB', 'AICTE Approved'],
    recruiters: ['Deloitte', 'KPMG', 'Amazon', 'HUL', 'Microsoft'],
    highestPackage: 6500000,
  },
  'jbims-mumbai': {
    id: 'jbims',
    logo: 'JBIMS',
    image: CAMPUS.jbims,
    imageBadges: ['Mumbai University', 'Top ROI', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Google', 'Amazon'],
    highestPackage: 9200000,
  },
  jbims: {
    id: 'jbims',
    logo: 'JBIMS',
    image: CAMPUS.jbims,
    imageBadges: ['Mumbai University', 'Top ROI', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Google', 'Amazon'],
    highestPackage: 9200000,
  },
  'iift-delhi': {
    id: 'iift',
    logo: 'IIFT',
    image: CAMPUS.iift,
    imageBadges: ['Trade & Finance', 'Govt. of India', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Amazon', 'Flipkart', 'Microsoft'],
    highestPackage: 6800000,
  },
  iift: {
    id: 'iift',
    logo: 'IIFT',
    image: CAMPUS.iift,
    imageBadges: ['Trade & Finance', 'Govt. of India', 'AICTE Approved'],
    recruiters: ['McKinsey', 'BCG', 'Amazon', 'Flipkart', 'Microsoft'],
    highestPackage: 6800000,
  },
};

export function resolveCollegeMeta(college) {
  if (college == null) return DEFAULT_COLLEGE_META;

  const keys = [
    college?.slug,
    college?.id,
    college?.name?.toLowerCase().replace(/\s+/g, '-'),
  ].filter(Boolean);

  for (const key of keys) {
    if (COLLEGE_CARD_META[key]) return COLLEGE_CARD_META[key];
  }

  const firstName = college?.name?.split(' ')[0]?.toLowerCase();
  const nameKey =
    firstName &&
    Object.keys(COLLEGE_CARD_META).find((k) => k.includes(firstName));
  if (nameKey) return COLLEGE_CARD_META[nameKey];

  return {
    logo: college?.name?.split(' ')[0]?.slice(0, 4)?.toUpperCase() || DEFAULT_COLLEGE_META.logo,
    image: FALLBACK_CAMPUS_IMAGE,
    imageBadges: college?.ranking
      ? [`#${college.ranking}`, 'AACSB']
      : DEFAULT_COLLEGE_META.imageBadges,
    recruiters: DEFAULT_RECRUITERS,
    highestPackage: college?.highest_package ?? college?.highestPackage ?? null,
  };
}

export function normalizeCollegeCard(college) {
  const meta = resolveCollegeMeta(college);

  if (college == null) {
    return {
      id: DEFAULT_COLLEGE_META.id,
      slug: null,
      name: 'MBA Program',
      location: 'India',
      image: FALLBACK_CAMPUS_IMAGE,
      logo: meta.logo,
      imageBadges: meta.imageBadges ?? [],
      recruiters: meta.recruiters ?? DEFAULT_RECRUITERS,
      ranking: null,
      rankingLabel: null,
      fees: null,
      avgPackage: null,
      highestPackage: null,
      exams: ['CAT'],
      matchScore: null,
      accreditations: meta.imageBadges?.filter((b) => !b.startsWith('#')) ?? [],
    };
  }

  const location =
    college?.location ||
    [college?.city, college?.state].filter(Boolean).join(', ') ||
    'India';

  return {
    id: college?.id ?? meta.id ?? college?.slug ?? DEFAULT_COLLEGE_META.id,
    slug: college?.slug ?? college?.id ?? null,
    name: college?.name || 'MBA Program',
    location,
    image:
      college?.cover_banner_url ||
      college?.image ||
      meta.image ||
      FALLBACK_CAMPUS_IMAGE,
    logo: meta.logo ?? DEFAULT_COLLEGE_META.logo,
    imageBadges: meta.imageBadges ?? [],
    recruiters: meta.recruiters ?? DEFAULT_RECRUITERS,
    ranking: college?.ranking ?? college?.rankNum ?? null,
    rankingLabel:
      college?.ranking ?? (college?.rankNum ? `#${college.rankNum} India` : null),
    fees: normalizeAnnualRupees(college?.fees_min ?? college?.fees) ?? null,
    avgPackage:
      normalizeAnnualRupees(college?.avg_package ?? college?.avgPackage) ?? null,
    highestPackage:
      normalizeAnnualRupees(
        college?.highest_package ?? college?.highestPackage ?? meta.highestPackage
      ) ?? null,
    exams: college?.accepted_exams ?? college?.exams ?? ['CAT'],
    matchScore: college?.match_score ?? college?.matchScore ?? null,
    accreditations:
      college?.accreditations ??
      meta.imageBadges?.filter((b) => !b.startsWith('#')) ??
      [],
  };
}
