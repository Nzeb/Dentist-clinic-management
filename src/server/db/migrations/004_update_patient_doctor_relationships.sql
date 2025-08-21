-- Add a new column to store the user id
ALTER TABLE patients ADD COLUMN assigned_user_id INTEGER;

-- Update the new column with the corresponding user id
UPDATE patients
SET assigned_user_id = users.id
FROM users
WHERE patients.assigned_doctor_id IS NOT NULL
AND users."fullName" = (SELECT name FROM doctors WHERE id = patients.assigned_doctor_id);

-- Drop the old foreign key constraint
ALTER TABLE patients DROP CONSTRAINT patients_assigned_doctor_id_fkey;

-- Drop the old column
ALTER TABLE patients DROP COLUMN assigned_doctor_id;

-- Rename the new column
ALTER TABLE patients RENAME COLUMN assigned_user_id TO assigned_doctor_id;

-- Add the new foreign key constraint
ALTER TABLE patients ADD CONSTRAINT patients_assigned_doctor_id_fkey
FOREIGN KEY (assigned_doctor_id) REFERENCES users(id) ON DELETE SET NULL;
