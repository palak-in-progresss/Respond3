-- RESPOND Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  skills TEXT[] NOT NULL DEFAULT '{}',
  certifications JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  availability_schedule JSONB DEFAULT '{}',
  rating DECIMAL(3, 2) DEFAULT 5.0,
  tasks_completed INTEGER DEFAULT 0,
  profile_image_url TEXT
);

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  skills_needed TEXT[] NOT NULL DEFAULT '{}',
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  volunteers_needed INTEGER NOT NULL,
  volunteers_assigned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'cancelled')),
  escalated BOOLEAN DEFAULT FALSE,
  escalation_count INTEGER DEFAULT 0
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_volunteers_location ON volunteers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_volunteers_skills ON volunteers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(verification_status, availability_status);
CREATE INDEX IF NOT EXISTS idx_requests_location ON requests(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_requests_skills ON requests USING GIN(skills_needed);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status, urgency);
CREATE INDEX IF NOT EXISTS idx_assignments_request ON assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON assignments(volunteer_id);

-- Row Level Security (RLS)
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Public read access for demo (adjust for production)
CREATE POLICY "Allow public read access on volunteers" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on volunteers" ON volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on volunteers" ON volunteers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on requests" ON requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on requests" ON requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on requests" ON requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on assignments" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on assignments" ON assignments FOR UPDATE USING (true);
