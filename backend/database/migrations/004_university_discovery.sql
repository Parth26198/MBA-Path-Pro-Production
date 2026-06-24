USE mba_admission_db;

CREATE TABLE IF NOT EXISTS saved_universities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  college_id INT NOT NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  UNIQUE KEY uk_student_college (student_id, college_id),
  INDEX idx_saved_student (student_id)
);

ALTER TABLE students ADD COLUMN target_programs JSON NULL;
ALTER TABLE students ADD COLUMN preferred_budget_max DECIMAL(12,2) NULL;
