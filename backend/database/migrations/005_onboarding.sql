ALTER TABLE students ADD COLUMN onboarding_completed TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE students ADD COLUMN onboarding_step INT NOT NULL DEFAULT 1;

UPDATE students SET onboarding_completed = 1, onboarding_step = 8 WHERE onboarding_completed = 0;
