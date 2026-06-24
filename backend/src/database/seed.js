import bcrypt from 'bcryptjs';
import { query, queryOne } from '../config/database.js';
import logger from '../utils/logger.js';

const hash = async (pw) => bcrypt.hash(pw, 10);

async function seed() {
  logger.info('Seeding database...');

  await query('DELETE FROM activity_logs');
  await query('DELETE FROM documents');
  await query('DELETE FROM notifications');
  await query('DELETE FROM trainer_sessions');
  await query('DELETE FROM timelines');
  await query('DELETE FROM preparation_tasks');
  await query('DELETE FROM application_checklists');
  await query('DELETE FROM applications');
  await query('DELETE FROM college_gallery');
  await query('DELETE FROM college_specializations');
  await query('DELETE FROM colleges');
  await query('DELETE FROM payments');
  await query('DELETE FROM students');
  await query('DELETE FROM trainers');
  await query('DELETE FROM users');
  await query('DELETE FROM packages');
  await query('DELETE FROM roles');

  await query(`INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator'),
    ('TRAINER', 'MBA admission trainer'),
    ('STUDENT', 'MBA aspirant student')`);

  const adminRole = await queryOne("SELECT id FROM roles WHERE name = 'ADMIN'");
  const trainerRole = await queryOne("SELECT id FROM roles WHERE name = 'TRAINER'");
  const studentRole = await queryOne("SELECT id FROM roles WHERE name = 'STUDENT'");

  const pwd = await hash('123456');

  const adminRes = await query(
    'INSERT INTO users (role_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
    [adminRole.id, 'Yash Patil', 'yash@admin.com', pwd]
  );

  const trainerRes = await query(
    'INSERT INTO users (role_id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
    [trainerRole.id, 'Aniket Sharma', 'aniket@trainer.com', pwd, '+91 98765 43210']
  );

  const studentRes = await query(
    'INSERT INTO users (role_id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
    [studentRole.id, 'Paresh Dahivelkar', 'paresh@student.com', pwd, '+91 91234 56789']
  );

  await query(
    'INSERT INTO trainers (user_id, specialization, experience_years, bio, students_assigned, rating) VALUES (?, ?, ?, ?, ?, ?)',
    [
      trainerRes.insertId,
      'IIM & ISB Admissions, GD-PI, Mock Interviews',
      8,
      'Senior MBA admission consultant with 500+ successful placements across top B-schools.',
      1,
      4.9,
    ]
  );

  const trainer = await queryOne('SELECT * FROM trainers WHERE user_id = ?', [trainerRes.insertId]);

  await query(`INSERT INTO packages (code, name, description, college_limit, price, features, is_featured, sort_order) VALUES
    ('A', 'Starter MBA', 'Perfect for focused applicants targeting select colleges', 5, 49999.00,
     '["5 College Applications", "Dedicated Trainer", "SOP & Resume Review", "Mock Interview (2)", "Application Tracking", "Email Support"]', 0, 1),
    ('B', 'Growth MBA', 'Most popular package for serious MBA aspirants', 7, 79999.00,
     '["7 College Applications", "Priority Trainer Support", "GD-PI Preparation", "Unlimited Mock Interviews", "Document Verification", "WhatsApp Support", "College Shortlisting"]', 1, 2),
    ('C', 'Elite MBA', 'Complete end-to-end admission management for top B-schools', 10, 129999.00,
     '["10 College Applications", "Senior Trainer (8+ yrs)", "Full GD-PI Program", "Profile Building", "Interview Confidence Coaching", "24/7 Priority Support", "Scholarship Guidance", "Post-Admission Support"]', 0, 3)`);

  const pkgB = await queryOne("SELECT * FROM packages WHERE code = 'B'");

  await query(
    `INSERT INTO students (user_id, package_id, trainer_id, colleges_allowed, colleges_applied, enrollment_date, payment_status, status)
     VALUES (?, ?, ?, ?, 3, CURDATE(), 'completed', 'active')`,
    [studentRes.insertId, pkgB.id, trainer.id, pkgB.college_limit]
  );

  const student = await queryOne('SELECT * FROM students WHERE user_id = ?', [studentRes.insertId]);

  await query(
    `INSERT INTO payments (student_id, package_id, amount, status, payment_method, transaction_ref, paid_at)
     VALUES (?, ?, ?, 'completed', 'simulated', 'TXN-PARESH-2024', NOW())`,
    [student.id, pkgB.id, pkgB.price]
  );

  const collegesData = [
    {
      name: 'IIM Ahmedabad',
      slug: 'iim-ahmedabad',
      location: 'Ahmedabad, Gujarat',
      city: 'Ahmedabad',
      state: 'Gujarat',
      ranking: 1,
      fees_min: 2300000,
      fees_max: 2500000,
      avg_package: 3650000,
      highest_package: 11500000,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf6f?w=800&q=80',
      description: 'Indian Institute of Management Ahmedabad is India\'s premier business school, renowned for its rigorous PGP program and exceptional placement record.',
      eligibility: 'Bachelor\'s degree with 50% marks. Valid CAT score with 99+ percentile preferred.',
      exams: ['CAT'],
      specs: ['Finance', 'Marketing', 'Operations', 'Strategy'],
      featured: 1,
    },
    {
      name: 'IIM Bangalore',
      slug: 'iim-bangalore',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      ranking: 2,
      fees_min: 2400000,
      fees_max: 2600000,
      avg_package: 3590000,
      highest_package: 10200000,
      image: 'https://images.unsplash.com/photo-1523580490184-6bbb2f281fd0?w=800&q=80',
      description: 'IIM Bangalore offers world-class management education in the heart of India\'s tech capital with strong industry connections.',
      eligibility: 'Graduation with minimum 50%. CAT/GMAT required.',
      exams: ['CAT', 'GMAT'],
      specs: ['Business Analytics', 'Finance', 'Marketing', 'HR'],
      featured: 1,
    },
    {
      name: 'IIM Calcutta',
      slug: 'iim-calcutta',
      location: 'Kolkata, West Bengal',
      city: 'Kolkata',
      state: 'West Bengal',
      ranking: 3,
      fees_min: 2700000,
      fees_max: 2900000,
      avg_package: 3450000,
      highest_package: 11000000,
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
      description: 'IIM Calcutta is among India\'s oldest and most prestigious management institutes with exceptional finance and consulting placements.',
      eligibility: 'Bachelor\'s degree with 50%. CAT required.',
      exams: ['CAT'],
      specs: ['Finance', 'Marketing', 'Operations', 'Strategy'],
      featured: 1,
    },
    {
      name: 'ISB Hyderabad',
      slug: 'isb-hyderabad',
      location: 'Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      ranking: 4,
      fees_min: 4100000,
      fees_max: 4500000,
      avg_package: 3410000,
      highest_package: 13000000,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
      description: 'Indian School of Business offers a world-class one-year PGP program with global faculty and unmatched peer group.',
      eligibility: '2+ years work experience. GMAT/GRE/CAT required.',
      exams: ['GMAT', 'GRE', 'CAT'],
      specs: ['Finance', 'Strategy', 'Marketing', 'Entrepreneurship'],
      featured: 1,
    },
    {
      name: 'XLRI Jamshedpur',
      slug: 'xlri-jamshedpur',
      location: 'Jamshedpur, Jharkhand',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      ranking: 5,
      fees_min: 2800000,
      fees_max: 3000000,
      avg_package: 2990000,
      highest_package: 7800000,
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      description: 'XLRI is India\'s oldest B-school, known for HR excellence and strong general management programs.',
      eligibility: 'Graduation with 50%+. XAT required.',
      exams: ['XAT'],
      specs: ['HR', 'Finance', 'Marketing', 'Operations'],
      featured: 1,
    },
    {
      name: 'SP Jain Institute of Management',
      slug: 'sp-jain-mumbai',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      ranking: 8,
      fees_min: 2200000,
      fees_max: 2400000,
      avg_package: 3300000,
      highest_package: 7500000,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      description: 'SPJIMR Mumbai is known for its values-driven leadership programs and excellent corporate placements in finance and consulting.',
      eligibility: 'Bachelor\'s degree. CAT/XAT/GMAT accepted.',
      exams: ['CAT', 'XAT', 'GMAT'],
      specs: ['Finance', 'Information Management', 'Marketing', 'Operations'],
      featured: 1,
    },
    {
      name: 'FMS Delhi',
      slug: 'fms-delhi',
      location: 'New Delhi, Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      ranking: 6,
      fees_min: 200000,
      fees_max: 250000,
      avg_package: 3420000,
      highest_package: 10000000,
      image: 'https://images.unsplash.com/photo-1498243693701-69f8a59efe8e?w=800&q=80',
      description: 'Faculty of Management Studies, University of Delhi offers exceptional ROI with top-tier placements at minimal fees.',
      eligibility: 'Graduation with 50%+. CAT required.',
      exams: ['CAT'],
      specs: ['Finance', 'Marketing', 'Operations', 'HR'],
      featured: 1,
    },
    {
      name: 'MDI Gurgaon',
      slug: 'mdi-gurgaon',
      location: 'Gurgaon, Haryana',
      city: 'Gurgaon',
      state: 'Haryana',
      ranking: 10,
      fees_min: 2600000,
      fees_max: 2800000,
      avg_package: 2650000,
      highest_package: 6500000,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      description: 'MDI Gurgaon is a leading private B-school with strong corporate connections in the NCR region.',
      eligibility: 'Bachelor\'s degree. CAT required.',
      exams: ['CAT'],
      specs: ['Finance', 'Marketing', 'HR', 'Operations'],
      featured: 1,
    },
    {
      name: 'JBIMS Mumbai',
      slug: 'jbims-mumbai',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      ranking: 7,
      fees_min: 600000,
      fees_max: 600000,
      avg_package: 2800000,
      highest_package: 9200000,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      description: 'Jamnalal Bajaj Institute of Management Studies is Mumbai\'s premier government B-school with exceptional ROI.',
      eligibility: 'Graduation with 50%+. MAH-CET / CAT required.',
      exams: ['MAH-CET', 'CAT'],
      specs: ['Finance', 'Marketing', 'Operations'],
      featured: 1,
    },
    {
      name: 'IIFT Delhi',
      slug: 'iift-delhi',
      location: 'New Delhi, Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      ranking: 9,
      fees_min: 2100000,
      fees_max: 2200000,
      avg_package: 2850000,
      highest_package: 6800000,
      image: 'https://images.unsplash.com/photo-1515187024625-57bc888b4373?w=800&q=80',
      description: 'Indian Institute of Foreign Trade is India\'s leading institute for international business and trade.',
      eligibility: 'Graduation with 50%+. IIFT entrance required.',
      exams: ['IIFT'],
      specs: ['International Business', 'Finance', 'Marketing'],
      featured: 1,
    },
    {
      name: 'INSEAD',
      slug: 'insead',
      location: 'Fontainebleau, France',
      city: 'Fontainebleau',
      state: 'France',
      ranking: 11,
      fees_min: 10500000,
      fees_max: 11000000,
      avg_package: 10800000,
      highest_package: 22000000,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      description: 'INSEAD is one of the world\'s leading and largest graduate business schools with campuses in Europe, Asia and the Middle East.',
      eligibility: 'Bachelor\'s degree. GMAT/GRE required. 2+ years experience.',
      exams: ['GMAT', 'GRE'],
      specs: ['Finance', 'Strategy', 'Marketing', 'Entrepreneurship'],
      featured: 1,
    },
    {
      name: 'HEC Paris',
      slug: 'hec-paris',
      location: 'Paris, France',
      city: 'Paris',
      state: 'France',
      ranking: 12,
      fees_min: 9800000,
      fees_max: 10200000,
      avg_package: 10200000,
      highest_package: 20000000,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      description: 'HEC Paris MBA is consistently ranked among the world\'s best with exceptional European and global career outcomes.',
      eligibility: 'Bachelor\'s degree. GMAT/GRE. Professional experience required.',
      exams: ['GMAT', 'GRE'],
      specs: ['Finance', 'Strategy', 'Marketing', 'Luxury'],
      featured: 1,
    },
    {
      name: 'London Business School',
      slug: 'london-business-school',
      location: 'London, UK',
      city: 'London',
      state: 'UK',
      ranking: 13,
      fees_min: 11500000,
      fees_max: 12000000,
      avg_package: 11200000,
      highest_package: 22000000,
      image: 'https://images.unsplash.com/photo-1498243693701-69f8a59efe8e?w=800&q=80',
      description: 'London Business School offers a world-class MBA in the heart of one of the world\'s leading financial centres.',
      eligibility: 'Bachelor\'s degree. GMAT/GRE. 3+ years experience preferred.',
      exams: ['GMAT', 'GRE'],
      specs: ['Finance', 'Consulting', 'Entrepreneurship', 'Strategy'],
      featured: 1,
    },
    {
      name: 'NUS Business School',
      slug: 'nus-singapore',
      location: 'Singapore',
      city: 'Singapore',
      state: 'Singapore',
      ranking: 14,
      fees_min: 7200000,
      fees_max: 7800000,
      avg_package: 8800000,
      highest_package: 16000000,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
      description: 'NUS Business School is Asia\'s leading business school with strong connections across the Asia-Pacific region.',
      eligibility: 'Bachelor\'s degree. GMAT/GRE required.',
      exams: ['GMAT', 'GRE'],
      specs: ['Finance', 'Marketing', 'Strategy', 'Analytics'],
      featured: 1,
    },
    {
      name: 'NMIMS Mumbai',
      slug: 'nmims-mumbai',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      ranking: 15,
      fees_min: 2100000,
      fees_max: 2300000,
      avg_package: 2420000,
      highest_package: 5500000,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
      description: 'NMIMS School of Business Management offers industry-aligned MBA programs with strong Mumbai corporate network.',
      eligibility: 'Graduation 50%+. NMAT by GMAC required.',
      exams: ['NMAT'],
      specs: ['Finance', 'Marketing', 'HR', 'Business Analytics'],
      featured: 0,
    },
    {
      name: 'Symbiosis Institute Pune',
      slug: 'symbiosis-pune',
      location: 'Pune, Maharashtra',
      city: 'Pune',
      state: 'Maharashtra',
      ranking: 18,
      fees_min: 1800000,
      fees_max: 2000000,
      avg_package: 2150000,
      highest_package: 4500000,
      image: 'https://images.unsplash.com/photo-1515187024625-57bc888b4373?w=800&q=80',
      description: 'SCMHRD Pune is among India\'s top HR and general management institutes with excellent industry interface.',
      eligibility: 'Bachelor\'s degree. SNAP test required.',
      exams: ['SNAP'],
      specs: ['HR', 'Marketing', 'Finance', 'Operations'],
      featured: 0,
    },
  ];

  const collegeIds = {};
  for (const c of collegesData) {
    const res = await query(
      `INSERT INTO colleges (name, slug, logo_url, cover_banner_url, description, location, city, state, ranking,
        fees_min, fees_max, avg_package, highest_package, eligibility, accepted_exams, deadlines, admission_process,
        website, contact_email, contact_phone, status, is_featured, created_by_trainer_id, approved_by_admin_id, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, NOW())`,
      [
        c.name, c.slug, c.image, c.image,
        c.description, c.location, c.city, c.state, c.ranking, c.fees_min, c.fees_max, c.avg_package, c.highest_package,
        c.eligibility, JSON.stringify(c.exams),
        JSON.stringify({ round1: '2025-01-15', final: '2025-03-30' }),
        'Online application → Shortlist → WAT/GD → PI → Final offer',
        `https://www.${c.slug.replace(/-/g, '')}.edu.in`,
        `admissions@${c.slug.split('-')[0]}.edu.in`, '+91 20 1234 5678',
        c.featured, trainer.id, adminRes.insertId,
      ]
    );
    collegeIds[c.slug] = res.insertId;
    for (const spec of c.specs) {
      await query('INSERT INTO college_specializations (college_id, name) VALUES (?, ?)', [res.insertId, spec]);
    }
    await query(
      'INSERT INTO college_gallery (college_id, image_url, caption, sort_order) VALUES (?, ?, ?, 0)',
      [res.insertId, c.image, `${c.name} Campus`]
    );
  }

  const app1 = await createApp(student.id, collegeIds['iim-ahmedabad'], trainer.id, 'Under Review', 'Interview Preparation', 'Strong profile. Focus on communication for PI.');
  await seedChecklist(app1, [
    ['Form Filled', 1], ['SOP Uploaded', 1], ['Resume Uploaded', 1], ['Fees Paid', 1], ['Mock Interview Pending', 0],
  ]);
  await seedTimeline(app1, student.id, trainerRes.insertId, [
    ['SOP corrected by trainer', 'Trainer reviewed and improved SOP structure and impact statements'],
    ['Resume reviewed', 'Resume optimized for IIM A format with quantified achievements'],
    ['Documents verified', 'All mandatory documents verified and approved'],
  ]);

  const app2 = await createApp(student.id, collegeIds['sp-jain-mumbai'], trainer.id, 'GDPI Preparation', 'GD Ready', 'Excellent GD performance. Work on PI storytelling.');
  await seedChecklist(app2, [
    ['Form Filled', 1], ['SOP Uploaded', 1], ['GD Practice Completed', 1], ['Interview Practice Pending', 0],
  ]);
  await seedTimeline(app2, student.id, trainerRes.insertId, [
    ['Trainer assigned GD questions', '15 GD topics shared for SPJIMR pattern practice'],
    ['Mock GD completed', 'Student performed well in mock GD with 7.5/10 rating'],
    ['Confidence improvement suggested', 'Recommended daily speaking practice for 15 minutes'],
  ]);

  const app3 = await createApp(student.id, collegeIds['isb-hyderabad'], trainer.id, 'Documents Pending', 'Not Started', 'Please upload SOP and transcript urgently.');
  await seedChecklist(app3, [
    ['Resume Uploaded', 1], ['SOP Pending', 0], ['Transcript Pending', 0],
  ]);
  await seedTimeline(app3, student.id, trainerRes.insertId, [
    ['Trainer requested missing documents', 'SOP draft and official transcript required for ISB application'],
    ['Student notified', 'Notification sent to upload pending documents within 48 hours'],
  ]);

  await query(
    `INSERT INTO preparation_tasks (student_id, trainer_id, title, description, task_type, resource_url, status, trainer_remarks, confidence_score, verified_at)
     VALUES (?, ?, 'MBA HR Interview Questions PDF', 'Complete HR interview preparation document', 'pdf', '/uploads/resources/hr-interview-questions.pdf', 'verified',
     'Student answered confidently but needs communication improvement.', 7, NOW())`,
    [student.id, trainer.id]
  );

  await query(
    `INSERT INTO preparation_tasks (student_id, trainer_id, title, description, task_type, resource_url, status, trainer_remarks)
     VALUES (?, ?, 'Watch GD Preparation Video', 'Complete GD preparation video module', 'video', '/uploads/resources/gd-prep-video.mp4', 'in_progress',
     'Student watched only partially.')`,
    [student.id, trainer.id]
  );

  await query(
    `INSERT INTO trainer_sessions (student_id, trainer_id, session_type, title, scheduled_at, duration_minutes, status, meet_link, notes, remarks, progress_rating)
     VALUES
     (?, ?, 'google_meet', 'Profile Review & College Shortlisting', DATE_SUB(NOW(), INTERVAL 14 DAY), 90, 'completed', 'https://meet.google.com/abc-defg-hij', 'Reviewed profile and shortlisted 7 target colleges', 'Student has strong academic profile', 8),
     (?, ?, 'mock_interview', 'IIM A Mock Personal Interview', DATE_SUB(NOW(), INTERVAL 7 DAY), 60, 'completed', NULL, 'Conducted full PI simulation with feedback', 'Needs improvement in Why MBA answer', 6),
     (?, ?, 'gd_practice', 'SPJIMR GD Mock Session', DATE_SUB(NOW(), INTERVAL 3 DAY), 75, 'completed', 'https://meet.google.com/xyz-uvwx-rst', 'Group discussion on AI in education', 'Good content, moderate leadership', 7),
     (?, ?, 'google_meet', 'ISB Application Strategy', DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'scheduled', 'https://meet.google.com/pqr-stuv-wxy', 'Plan ISB application timeline', NULL, NULL)`,
    [student.id, trainer.id, student.id, trainer.id, student.id, trainer.id, student.id, trainer.id]
  );

  const notifications = [
    [studentRes.insertId, 'Welcome to MBA Path Pro!', 'Your Growth MBA package is now active. Trainer Aniket Sharma will guide you.', 'success'],
    [studentRes.insertId, 'Trainer Assigned', 'Aniket Sharma has been assigned as your dedicated MBA admission trainer.', 'info'],
    [studentRes.insertId, 'Documents Required', 'Please upload SOP and transcript for ISB Hyderabad application.', 'warning'],
    [trainerRes.insertId, 'New Student Assigned', 'Paresh Dahivelkar has been assigned to you for MBA admission support.', 'success'],
    [adminRes.insertId, 'New Student Enrolled', 'Paresh Dahivelkar joined with Growth MBA package (₹79,999).', 'success'],
  ];

  for (const [uid, title, msg, type] of notifications) {
    await query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [uid, title, msg, type]);
  }

  await query(
    `INSERT INTO documents (student_id, uploaded_by_user_id, application_id, title, file_url, file_type, category, status)
     VALUES
     (?, ?, ?, 'Statement of Purpose - IIM A', '/uploads/documents/sop-iim-a.pdf', 'application/pdf', 'sop', 'verified'),
     (?, ?, ?, 'Resume - Updated', '/uploads/documents/resume-paresh.pdf', 'application/pdf', 'resume', 'verified'),
     (?, ?, NULL, 'Transcript - Pending', '/uploads/documents/transcript-pending.pdf', 'application/pdf', 'transcript', 'pending')`,
    [student.id, studentRes.insertId, app1, student.id, studentRes.insertId, app1, student.id, studentRes.insertId]
  );

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES
     (?, 'STUDENT_REGISTERED', 'student', ?, 'Paresh Dahivelkar enrolled in Growth MBA'),
     (?, 'ASSIGN_TRAINER', 'student', ?, 'Admin assigned Aniket Sharma to Paresh'),
     (?, 'APPLICATION_UPDATE', 'application', ?, 'IIM Ahmedabad application moved to Under Review'),
     (?, 'SESSION_COMPLETED', 'session', 2, 'Mock interview session completed')`,
    [studentRes.insertId, student.id, adminRes.insertId, student.id, trainerRes.insertId, app1, trainerRes.insertId]
  );

  logger.info('Seed completed successfully!');
  logger.info('Login credentials:');
  logger.info('  Admin:   yash@admin.com / 123456');
  logger.info('  Trainer: aniket@trainer.com / 123456');
  logger.info('  Student: paresh@student.com / 123456');
  process.exit(0);
}

async function createApp(studentId, collegeId, trainerId, status, prepStatus, remarks) {
  const res = await query(
    `INSERT INTO applications (student_id, college_id, trainer_id, status, preparation_status, trainer_remarks, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [studentId, collegeId, trainerId, status, prepStatus, remarks]
  );
  return res.insertId;
}

async function seedChecklist(appId, items) {
  let order = 0;
  for (const [title, done] of items) {
    if (done) {
      await query(
        `INSERT INTO application_checklists (application_id, title, is_completed, completed_by_trainer, completed_at, sort_order)
         VALUES (?, ?, 1, 1, NOW(), ?)`,
        [appId, title, order++]
      );
    } else {
      await query(
        `INSERT INTO application_checklists (application_id, title, is_completed, completed_by_trainer, sort_order)
         VALUES (?, ?, 0, 0, ?)`,
        [appId, title, order++]
      );
    }
  }
}

async function seedTimeline(appId, studentId, actorId, events) {
  for (const [title, desc] of events) {
    await query(
      'INSERT INTO timelines (application_id, student_id, actor_user_id, title, description, event_type) VALUES (?, ?, ?, ?, ?, ?)',
      [appId, studentId, actorId, title, desc, 'application']
    );
  }
}

seed().catch((e) => {
  logger.error(e);
  process.exit(1);
});
