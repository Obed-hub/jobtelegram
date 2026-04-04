import { UserProfile } from './job';

/**
 * Normalized job schema — every source adapter converts into this format.
 * This is the single canonical structure used for matching, deduplication, and display.
 */
export interface NormalizedJob {
  id: string;
  source: JobSource;
  external_id: string;
  title: string;
  normalized_title: string;
  company: string;
  company_slug: string;
  department: string | null;
  description: string;
  short_description: string;
  tags: string[];
  skills_inferred: string[];
  location: string;
  location_tokens: string[];
  remote_type: 'remote' | 'hybrid' | 'onsite' | 'unknown';
  work_type: 'remote' | 'freelance' | 'contract' | 'full-time' | 'part-time' | 'unknown';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_display: string;
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
  url: string;
  logo: string | null;
  created_at: string;
  fetched_at: string;
  dedupe_hash: string;
  requirements: string[];
  active: boolean;
}

export type JobSource = 'remotive' | 'arbeitnow' | 'remoteok' | 'greenhouse' | 'lever' | 'hacker_news' | 'weworkremotely' | 'mock';

export interface SyncResult {
  source: JobSource;
  started_at: string;
  finished_at: string;
  jobs_fetched: number;
  jobs_saved: number;
  duplicates_skipped: number;
  errors: string[];
}

export interface SourceAdapter {
  source: JobSource;
  fetchJobs(options?: { profile?: UserProfile }): Promise<NormalizedJob[]>;
}
