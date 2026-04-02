/**
 * Arbeitnow.com job source adapter
 * API: https://www.arbeitnow.com/api/job-board-api
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, detectWorkType, extractSeniority,
  parseSalary, shortDescription, stripHtml, extractListItems,
} from '@/lib/normalize';
import { inferSkills, normalizeTags } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

function mapJob(raw: ArbeitnowJob): NormalizedJob {
  const title = raw.title || '';
  const company = raw.company_name || 'Unknown';
  const description = stripHtml(raw.description || '');
  const normTitle = normalizeTitle(title);
  const slug = companySlug(company);
  const location = raw.remote ? `Remote · ${raw.location || ''}`.trim() : (raw.location || '');
  const tags = normalizeTags(raw.tags || []);
  const requirements = extractListItems(raw.description || '');

  return {
    id: `arbeitnow_${raw.slug}`,
    source: 'arbeitnow',
    external_id: raw.slug,
    title,
    normalized_title: normTitle,
    company,
    company_slug: slug,
    department: null,
    description,
    short_description: shortDescription(description),
    tags,
    skills_inferred: inferSkills(title, description, raw.tags),
    location,
    location_tokens: tokenizeLocation(location),
    remote_type: raw.remote ? 'remote' : detectRemoteType(location),
    work_type: detectWorkType(raw.job_types?.join(' '), raw.tags),
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    salary_display: '',
    seniority: extractSeniority(title),
    url: raw.url || `https://www.arbeitnow.com/view/${raw.slug}`,
    logo: null,
    created_at: raw.created_at ? new Date(raw.created_at * 1000).toISOString() : new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    dedupe_hash: generateDedupeHash(slug, normTitle, location),
    requirements,
    active: true,
  };
}

export const arbeitnowAdapter: SourceAdapter = {
  source: 'arbeitnow',
  async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
    try {
      const res = await fetch('/api/arbeitnow/api/job-board-api');
      if (!res.ok) throw new Error(`Arbeitnow API error: ${res.status}`);
      const data = await res.json();
      const jobs: ArbeitnowJob[] = data.data || [];
      return jobs.map(mapJob);
    } catch (err) {
      console.error('[Arbeitnow] Fetch failed:', err);
      return [];
    }
  },
};
