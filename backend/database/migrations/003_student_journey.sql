USE mba_admission_db;

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  package_id INT NOT NULL,
  payment_id INT NULL,
  status ENUM('pending','active','expired','cancelled') DEFAULT 'pending',
  college_limit INT NOT NULL,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_subscriptions_student_status (student_id, status)
);

ALTER TABLE students ADD COLUMN city VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN state VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN career_goal VARCHAR(500) NULL;
ALTER TABLE students ADD COLUMN target_countries JSON NULL;
ALTER TABLE students ADD COLUMN academic_details JSON NULL;
ALTER TABLE students ADD COLUMN work_experience JSON NULL;

UPDATE students
SET colleges_allowed = 0, package_id = NULL
WHERE payment_status = 'pending' AND colleges_allowed > 0 AND package_id IS NOT NULL;

INSERT INTO subscriptions (student_id, package_id, payment_id, status, college_limit, starts_at)
SELECT s.id, s.package_id, p.id, 'active', pk.college_limit, COALESCE(p.paid_at, NOW())
FROM students s
JOIN packages pk ON s.package_id = pk.id
LEFT JOIN payments p ON p.student_id = s.id AND p.package_id = s.package_id AND p.status = 'completed'
WHERE s.payment_status = 'completed' AND s.package_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.student_id = s.id AND sub.status = 'active');
