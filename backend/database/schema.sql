-- MBA Admission Management Platform - MySQL Schema
CREATE DATABASE IF NOT EXISTS mba_admission_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mba_admission_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS trainer_sessions;
DROP TABLE IF EXISTS timelines;
DROP TABLE IF EXISTS preparation_tasks;
DROP TABLE IF EXISTS application_checklists;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS college_gallery;
DROP TABLE IF EXISTS college_specializations;
DROP TABLE IF EXISTS colleges;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS trainers;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS activity_logs;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_role (role_id),
  INDEX idx_users_email (email)
);

CREATE TABLE packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  college_limit INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSON,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE trainers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  specialization VARCHAR(255),
  experience_years INT DEFAULT 0,
  bio TEXT,
  students_assigned INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 4.50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  package_id INT,
  trainer_id INT NULL,
  colleges_allowed INT DEFAULT 0,
  colleges_applied INT DEFAULT 0,
  enrollment_date DATE,
  payment_status ENUM('pending','completed','failed') DEFAULT 'pending',
  status ENUM('active','inactive','completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id),
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
  INDEX idx_students_trainer (trainer_id),
  INDEX idx_students_package (package_id)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  package_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'simulated',
  transaction_ref VARCHAR(100),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE TABLE colleges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  cover_banner_url VARCHAR(500),
  description TEXT,
  location VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  ranking INT,
  fees_min DECIMAL(12,2),
  fees_max DECIMAL(12,2),
  avg_package DECIMAL(12,2),
  highest_package DECIMAL(12,2),
  eligibility TEXT,
  accepted_exams JSON,
  deadlines JSON,
  admission_process TEXT,
  website VARCHAR(500),
  contact_email VARCHAR(150),
  contact_phone VARCHAR(20),
  status ENUM('draft','pending_approval','published','archived','rejected') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  created_by_trainer_id INT NULL,
  approved_by_admin_id INT NULL,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_colleges_status (status),
  INDEX idx_colleges_featured (is_featured)
);

CREATE TABLE college_specializations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  INDEX idx_spec_college (college_id)
);

CREATE TABLE college_gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  sort_order INT DEFAULT 0,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  college_id INT NOT NULL,
  trainer_id INT,
  status VARCHAR(100) NOT NULL DEFAULT 'Draft',
  preparation_status VARCHAR(100) DEFAULT 'Not Started',
  trainer_remarks TEXT,
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES colleges(id),
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
  UNIQUE KEY uk_student_college (student_id, college_id),
  INDEX idx_app_student (student_id),
  INDEX idx_app_status (status)
);

CREATE TABLE application_checklists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by_trainer BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_checklist_app (application_id)
);

CREATE TABLE preparation_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  trainer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type ENUM('pdf','video','interview','gd','assignment','other') DEFAULT 'other',
  resource_url VARCHAR(500),
  status ENUM('assigned','in_progress','completed','verified') DEFAULT 'assigned',
  trainer_remarks TEXT,
  confidence_score INT,
  due_date DATE,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id),
  INDEX idx_prep_student (student_id)
);

CREATE TABLE timelines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NULL,
  student_id INT NOT NULL,
  actor_user_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_timeline_student (student_id),
  INDEX idx_timeline_app (application_id)
);

CREATE TABLE trainer_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  trainer_id INT NOT NULL,
  session_type ENUM('google_meet','phone_call','mock_interview','gd_practice','counseling') NOT NULL,
  title VARCHAR(255),
  scheduled_at DATETIME,
  duration_minutes INT DEFAULT 60,
  status ENUM('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
  meet_link VARCHAR(500),
  notes TEXT,
  remarks TEXT,
  progress_rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id),
  INDEX idx_session_student (student_id),
  INDEX idx_session_trainer (trainer_id)
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read)
);

CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  uploaded_by_user_id INT NOT NULL,
  application_id INT NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  category ENUM('sop','resume','transcript','lor','other') DEFAULT 'other',
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
);

CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_activity_created (created_at)
);
