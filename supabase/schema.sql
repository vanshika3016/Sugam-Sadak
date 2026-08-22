-- Sugam Sadak Database Schema for Supabase (PostgreSQL + PostGIS)
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE user_role AS ENUM ('citizen', 'government', 'contractor');
CREATE TYPE hazard_status AS ENUM ('reported', 'verified', 'assigned', 'in_repair', 'inspection', 'resolved', 'reopen_window', 'closed');
CREATE TYPE hazard_type AS ENUM ('pothole', 'open_manhole', 'broken_streetlight', 'missing_barricade', 'road_damage', 'bridge_damage', 'drainage_issue', 'other');
CREATE TYPE severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE risk_band AS ENUM ('healthy', 'watch', 'maintenance_due', 'critical');
CREATE TYPE road_surface_type AS ENUM ('asphalt', 'concrete', 'paver', 'gravel', 'unknown');
CREATE TYPE road_type AS ENUM ('primary', 'secondary', 'connector', 'internal');
CREATE TYPE dlp_flag_status AS ENUM ('none', 'possible_recurrence', 'chargeable_confirmed', 'not_chargeable');
CREATE TYPE task_status AS ENUM ('pending_acceptance', 'accepted', 'in_progress', 'submitted', 'completed', 'failed_inspection');
CREATE TYPE inspection_status AS ENUM ('pending', 'scheduled', 'completed');
CREATE TYPE inspection_result AS ENUM ('pass', 'fail', 'pending');

-- Core tables

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  ward INTEGER,
  contractor_id UUID,
  avatar_initial TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractors table
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0,
  on_time_percent INTEGER DEFAULT 0,
  active_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Road assets table
CREATE TABLE public.road_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  ward INTEGER NOT NULL,
  jurisdiction TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  road_type road_type NOT NULL,
  surface_type road_surface_type NOT NULL,
  length_meters INTEGER,
  width_meters INTEGER,
  construction_year INTEGER,
  constructing_agency TEXT,
  last_maintenance_date TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  health_score INTEGER DEFAULT 100,
  risk_band risk_band DEFAULT 'healthy',
  active_hazard_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Operational',
  allocated_budget_inr BIGINT DEFAULT 0,
  spent_budget_inr BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hazard reports table
CREATE TABLE public.hazard_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT NOT NULL UNIQUE,
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  road_id TEXT NOT NULL,
  citizen_id UUID NOT NULL REFERENCES public.users(id),
  hazard_type hazard_type NOT NULL,
  severity severity NOT NULL,
  status hazard_status NOT NULL DEFAULT 'reported',
  description TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  location_label TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_department TEXT,
  assigned_contractor_id UUID REFERENCES public.contractors(id),
  assigned_contractor_name TEXT,
  task_id UUID,
  priority priority NOT NULL DEFAULT 'medium',
  dlp_flag_status dlp_flag_status DEFAULT 'none',
  expected_next_step TEXT
);

-- Contractor tasks table
CREATE TABLE public.contractor_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT NOT NULL UNIQUE,
  report_id TEXT NOT NULL,
  hazard_report_id UUID NOT NULL REFERENCES public.hazard_reports(id),
  contractor_id UUID NOT NULL REFERENCES public.contractors(id),
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  road_id TEXT NOT NULL,
  road_name TEXT NOT NULL,
  hazard_type hazard_type NOT NULL,
  severity severity NOT NULL,
  location TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'pending_acceptance',
  hazard_status hazard_status NOT NULL DEFAULT 'assigned',
  priority priority NOT NULL DEFAULT 'medium',
  sla_days INTEGER DEFAULT 3,
  deadline TIMESTAMPTZ NOT NULL,
  instructions TEXT,
  evidence JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance records table
CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  date TIMESTAMPTZ NOT NULL,
  work_performed TEXT NOT NULL,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id),
  contractor_name TEXT NOT NULL,
  cost_inr BIGINT NOT NULL,
  result TEXT NOT NULL,
  evidence_url TEXT,
  location_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections table
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT NOT NULL,
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  task_id UUID REFERENCES public.contractor_tasks(id),
  officer_id UUID NOT NULL REFERENCES public.users(id),
  officer_name TEXT NOT NULL,
  status inspection_status NOT NULL DEFAULT 'pending',
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  condition TEXT,
  remarks TEXT,
  result inspection_result DEFAULT 'pending',
  evidence JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DLP records table
CREATE TABLE public.dlp_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  road_id TEXT NOT NULL,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id),
  contractor_name TEXT NOT NULL,
  repair_id TEXT NOT NULL,
  location_key TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lifecycle events table
CREATE TABLE public.lifecycle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  road_id TEXT NOT NULL,
  report_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status hazard_status,
  actor_name TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost events table
CREATE TABLE public.cost_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  amount_inr BIGINT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_asset_id UUID NOT NULL REFERENCES public.road_assets(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table (hash-chained for tamper evidence)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES public.users(id),
  actor_name TEXT NOT NULL,
  details TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  prev_entry_hash TEXT,
  entry_hash TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_road_assets_ward ON public.road_assets(ward);
CREATE INDEX idx_road_assets_coordinates ON public.road_assets USING GIST (coordinates);
CREATE INDEX idx_hazard_reports_road_asset ON public.hazard_reports(road_asset_id);
CREATE INDEX idx_hazard_reports_citizen ON public.hazard_reports(citizen_id);
CREATE INDEX idx_hazard_reports_status ON public.hazard_reports(status);
CREATE INDEX idx_contractor_tasks_contractor ON public.contractor_tasks(contractor_id);
CREATE INDEX idx_contractor_tasks_status ON public.contractor_tasks(status);
CREATE INDEX idx_inspections_status ON public.inspections(status);
CREATE INDEX idx_dlp_records_active ON public.dlp_records(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_lifecycle_events_road ON public.lifecycle_events(road_id);
CREATE INDEX idx_audit_logs_report ON public.audit_logs(report_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dlp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Government can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );

-- Contractors policies
CREATE POLICY "Anyone can view contractors" ON public.contractors
  FOR SELECT USING (TRUE);
CREATE POLICY "Government can manage contractors" ON public.contractors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );

-- Road assets policies
CREATE POLICY "Public can view road assets (limited)" ON public.road_assets
  FOR SELECT USING (TRUE);
CREATE POLICY "Government can manage road assets" ON public.road_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "Contractors can view assigned road assets" ON public.road_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contractor_tasks ct
      JOIN public.users u ON u.contractor_id = ct.contractor_id
      WHERE ct.road_asset_id = road_assets.id AND u.id = auth.uid()
    )
  );

-- Hazard reports policies
CREATE POLICY "Citizens can create hazard reports" ON public.hazard_reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'citizen')
  );
CREATE POLICY "Citizens can view own reports" ON public.hazard_reports
  FOR SELECT USING (citizen_id = auth.uid());
CREATE POLICY "Government can view all reports" ON public.hazard_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "Government can update reports" ON public.hazard_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "Contractors can view assigned reports" ON public.hazard_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contractor_tasks ct
      JOIN public.users u ON u.contractor_id = ct.contractor_id
      WHERE ct.hazard_report_id = hazard_reports.id AND u.id = auth.uid()
    )
  );

-- Contractor tasks policies
CREATE POLICY "Government can manage tasks" ON public.contractor_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "Contractors can view own tasks" ON public.contractor_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.contractor_id = contractor_tasks.contractor_id AND u.id = auth.uid()
    )
  );
CREATE POLICY "Contractors can update own tasks" ON public.contractor_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.contractor_id = contractor_tasks.contractor_id AND u.id = auth.uid()
    )
  );

-- Inspections policies
CREATE POLICY "Government can manage inspections" ON public.inspections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "Contractors can view inspections for own tasks" ON public.inspections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contractor_tasks ct
      JOIN public.users u ON u.contractor_id = ct.contractor_id
      WHERE ct.id = inspections.task_id AND u.id = auth.uid()
    )
  );

-- DLP records policies
CREATE POLICY "Government can manage DLP records" ON public.dlp_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "Contractors can view own DLP records" ON public.dlp_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.contractor_id = dlp_records.contractor_id AND u.id = auth.uid()
    )
  );

-- Lifecycle events policies
CREATE POLICY "Public can view lifecycle events" ON public.lifecycle_events
  FOR SELECT USING (TRUE);
CREATE POLICY "Government can insert lifecycle events" ON public.lifecycle_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );

-- Cost events policies
CREATE POLICY "Government can manage cost events" ON public.cost_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );

-- Documents policies
CREATE POLICY "Public can view documents" ON public.documents
  FOR SELECT USING (TRUE);
CREATE POLICY "Government can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );

-- Audit logs policies
CREATE POLICY "Government can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'government')
  );
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_contractors_updated_at BEFORE UPDATE ON public.contractors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_road_assets_updated_at BEFORE UPDATE ON public.road_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_hazard_reports_updated_at BEFORE UPDATE ON public.hazard_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_contractor_tasks_updated_at BEFORE UPDATE ON public.contractor_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_inspections_updated_at BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to compute hash for audit log chaining
CREATE OR REPLACE FUNCTION public.compute_audit_hash(
  prev_hash TEXT,
  actor_id UUID,
  action TEXT,
  occurred_at TIMESTAMPTZ
) RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN encode(
    digest(prev_hash || actor_id::text || action || occurred_at::text, 'sha256'),
    'hex'
  );
END;
$$;