-- MBA Path Pro Production Migration 001
-- Each statement is idempotent via runMigrations.js (ER_DUP_FIELDNAME skip)

USE mba_admission_db;

ALTER TABLE documents ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE documents ADD COLUMN verified_by_user_id INT NULL;
ALTER TABLE documents ADD COLUMN verified_at TIMESTAMP NULL;
ALTER TABLE documents ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE preparation_tasks ADD COLUMN student_notes TEXT NULL;
ALTER TABLE preparation_tasks ADD COLUMN student_completed_at TIMESTAMP NULL;

ALTER TABLE trainer_sessions ADD COLUMN attendance ENUM('scheduled','present','absent','late','excused') DEFAULT 'scheduled';

ALTER TABLE payments ADD COLUMN razorpay_order_id VARCHAR(100) NULL;
ALTER TABLE payments ADD COLUMN razorpay_payment_id VARCHAR(100) NULL;
ALTER TABLE payments ADD COLUMN invoice_number VARCHAR(50) NULL;
ALTER TABLE payments ADD COLUMN invoice_url VARCHAR(500) NULL;
ALTER TABLE payments ADD COLUMN failure_reason TEXT NULL;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_token (token)
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
