-- 0. GRANT PERMISSIONS (Fixes the "Permission Denied" error)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 1. Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_by TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Slots table
CREATE TABLE IF NOT EXISTS slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, date, start_time)
);

-- 3. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL, -- Clerk user ID
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  slot_id UUID NOT NULL REFERENCES slots(id),
  visit_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Row Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Re-created to ensure clean state)
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;
CREATE POLICY "Anyone can view doctors" ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert doctors" ON doctors;
CREATE POLICY "Authenticated users can insert doctors" ON doctors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view slots" ON slots;
CREATE POLICY "Anyone can view slots" ON slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage slots" ON slots;
CREATE POLICY "Authenticated users can manage slots" ON slots FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to appointments" ON appointments;
CREATE POLICY "Full access to appointments" ON appointments FOR ALL USING (true);

-- 6. Seed data
INSERT INTO doctors (id, name, specialty, qualification, bio, photo_url, created_by) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dr. Sarah Johnson', 'Cardiology', 'MBBS, MD (Cardiology)', 'Experienced cardiologist.', '/doctors/doctor-1.jpg', 'admin_seed'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Dr. Michael Chen', 'Dermatology', 'MBBS, MD (Dermatology)', 'Board-certified dermatologist.', '/doctors/doctor-2.jpg', 'admin_seed')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 7. Generate Slots
DO $$
DECLARE
  doc_id UUID;
  slot_date DATE;
  slot_time TIME;
BEGIN
  FOR doc_id IN SELECT id FROM doctors LOOP
    FOR i IN 0..6 LOOP
      slot_date := CURRENT_DATE + i;
      slot_time := '09:00'::TIME;
      WHILE slot_time < '17:00'::TIME LOOP
        INSERT INTO slots (doctor_id, date, start_time, end_time, is_available)
        VALUES (doc_id, slot_date, slot_time, slot_time + INTERVAL '30 minutes', true)
        ON CONFLICT DO NOTHING;
        slot_time := slot_time + INTERVAL '30 minutes';
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
