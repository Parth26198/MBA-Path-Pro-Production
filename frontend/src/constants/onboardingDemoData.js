/** Realistic MBA preview data when API returns empty during onboarding. */
export const DEMO_UNIVERSITIES = [
  {
    id: 'demo-isb',
    name: 'Indian School of Business',
    location: 'Hyderabad, India',
    country: 'India',
    ranking: 1,
    match_score: 94,
    fees_max: 4500000,
    avg_package: 3410000,
    match: {
      label: 'Excellent fit',
      factors: [
        { key: 'career', label: 'Career alignment', detail: 'Strong consulting & finance placement track' },
        { key: 'budget', label: 'Budget fit', detail: 'Within your stated investment range' },
        { key: 'experience', label: 'Experience match', detail: 'Ideal for 3–8 years pre-MBA experience' },
      ],
    },
  },
  {
    id: 'demo-iima',
    name: 'IIM Ahmedabad',
    location: 'Ahmedabad, India',
    country: 'India',
    ranking: 2,
    match_score: 91,
    fees_max: 3300000,
    avg_package: 3650000,
    match: {
      label: 'Top tier',
      factors: [
        { key: 'academic', label: 'Academic profile', detail: 'Competitive for top Indian B-schools' },
        { key: 'career', label: 'Career goals', detail: 'Leadership roles in product & strategy' },
      ],
    },
  },
  {
    id: 'demo-hec',
    name: 'HEC Paris',
    location: 'Paris, France',
    country: 'France',
    ranking: 12,
    match_score: 87,
    fees_max: 9800000,
    avg_package: 10200000,
    match: {
      label: 'Global option',
      factors: [
        { key: 'countries', label: 'Target countries', detail: 'Matches your Europe study preference' },
        { key: 'program', label: 'Program format', detail: 'Full-time MBA with strong international cohort' },
      ],
    },
  },
  {
    id: 'demo-insead',
    name: 'INSEAD',
    location: 'Fontainebleau, France',
    country: 'France',
    ranking: 8,
    match_score: 85,
    fees_max: 10500000,
    avg_package: 10800000,
    match: {
      label: 'Global reach',
      factors: [
        { key: 'career', label: 'Post-MBA path', detail: 'Consulting & international business roles' },
        { key: 'network', label: 'Alumni network', detail: 'One of the largest global MBA networks' },
      ],
    },
  },
  {
    id: 'demo-nus',
    name: 'NUS Business School',
    location: 'Singapore',
    country: 'Singapore',
    ranking: 18,
    match_score: 82,
    fees_max: 7200000,
    avg_package: 8800000,
    match: {
      label: 'Asia hub',
      factors: [
        { key: 'countries', label: 'Location', detail: 'Gateway to Asia-Pacific markets' },
        { key: 'budget', label: 'ROI', detail: 'Strong salary uplift for regional roles' },
      ],
    },
  },
];

export const DEMO_PROGRAMS = [
  {
    id: 'demo-pgpm',
    program_name: 'Post Graduate Programme in Management',
    university_name: 'IIM Ahmedabad',
    location: 'Ahmedabad',
    duration: '2 years',
    format: 'Full-time',
    match_score: 92,
    fees_max: 3300000,
    match: {
      factors: [
        { key: 'career', label: 'Career fit', detail: 'General management with consulting & finance electives' },
        { key: 'exams', label: 'Exam profile', detail: 'CAT / GMAT accepted pathways' },
      ],
    },
  },
  {
    id: 'demo-pgp',
    program_name: 'Post Graduate Programme',
    university_name: 'ISB Hyderabad',
    location: 'Hyderabad',
    duration: '1 year',
    format: 'Full-time',
    match_score: 90,
    fees_max: 4500000,
    match: {
      factors: [
        { key: 'experience', label: 'Experience', detail: 'Accelerated format for experienced professionals' },
        { key: 'placement', label: 'Placements', detail: 'Top-tier consulting & tech recruiting' },
      ],
    },
  },
  {
    id: 'demo-mba',
    program_name: 'MBA',
    university_name: 'HEC Paris',
    location: 'Paris',
    duration: '16 months',
    format: 'Full-time',
    match_score: 86,
    fees_max: 9800000,
    match: {
      factors: [
        { key: 'global', label: 'International', detail: 'Multi-campus options and global exchange' },
        { key: 'languages', label: 'Languages', detail: 'English-taught with French business immersion' },
      ],
    },
  },
  {
    id: 'demo-exec',
    program_name: 'Executive MBA',
    university_name: 'INSEAD',
    location: 'Global campuses',
    duration: '18 months',
    format: 'Executive',
    match_score: 84,
    fees_max: 12500000,
    match: {
      factors: [
        { key: 'format', label: 'Format', detail: 'Designed for senior professionals' },
        { key: 'network', label: 'Cohort', detail: 'Peers with 10+ years experience' },
      ],
    },
  },
];

export const NEXT_STEPS = [
  {
    emoji: '🔍',
    title: 'Explore your matches',
    desc: 'Browse full university profiles, rankings, and placement data.',
  },
  {
    emoji: '📋',
    title: 'Compare shortlist',
    desc: 'Side-by-side compare fees, ROI, and program formats.',
  },
  {
    emoji: '📝',
    title: 'Start applications',
    desc: 'Track deadlines and documents in your dashboard.',
  },
  {
    emoji: '🎯',
    title: 'Book mentor session',
    desc: 'Get 1:1 guidance on essays and interview prep.',
  },
];
