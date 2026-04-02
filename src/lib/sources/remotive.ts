/**
 * Remotive.com job source adapter
 * Updated for structured requirements.
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, detectWorkType, extractSeniority,
  parseSalary, shortDescription, stripHtml, extractListItems,
} from '@/lib/normalize';
import { inferSkills, normalizeTags } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

function mapJob(raw: RemotiveJob): NormalizedJob {
  const title = raw.title || '';
  const company = raw.company_name || 'Unknown';
  const description = stripHtml(raw.description || '');
  const normTitle = normalizeTitle(title);
  const slug = companySlug(company);
  const location = raw.candidate_required_location || 'Remote';
  const salary = parseSalary(raw.salary);
  const tags = normalizeTags(raw.tags || []);
  const requirements = extractListItems(raw.description || '');

  return {
    id: `remotive_${raw.id}`,
    source: 'remotive',
    external_id: String(raw.id),
    title,
    normalized_title: normTitle,
    company,
    company_slug: slug,
    department: raw.category || null,
    description,
    short_description: shortDescription(description),
    tags,
    skills_inferred: inferSkills(title, description, raw.tags),
    location,
    location_tokens: tokenizeLocation(location),
    remote_type: detectRemoteType(location, raw.job_type),
    work_type: detectWorkType(raw.job_type, raw.tags),
    salary_min: salary.min,
    salary_max: salary.max,
    salary_currency: salary.currency,
    salary_display: salary.display,
    seniority: extractSeniority(title),
    url: raw.url || `https://remotive.com/remote-jobs/${raw.id}`,
    logo: raw.company_logo || null,
    created_at: raw.publication_date || new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    dedupe_hash: generateDedupeHash(slug, normTitle, location),
    requirements,
    active: true,
  };
}

export const remotiveAdapter: SourceAdapter = {
  source: 'remotive',
  async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
    try {
      const res = await fetch('/api/remotive/api/remote-jobs?limit=50');
      if (!res.ok) throw new Error(`Remotive API error: ${res.status}`);
      const data = await res.json();
      const jobs: RemotiveJob[] = data.jobs || [];
      return jobs.map(mapJob);
    } catch (err) {
      console.error('[Remotive] Fetch failed:', err);
      return [];
    }
  },
};
