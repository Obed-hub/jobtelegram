/**
 * RemoteOK.com job source adapter
 * API: https://remoteok.com/api (returns JSON array, first element is metadata)
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, extractSeniority,
  parseSalary, shortDescription, stripHtml, extractListItems,
} from '@/lib/normalize';
import { inferSkills, normalizeTags } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

interface RemoteOKJob {
  id: string;
  epoch: number;
  date: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
}

function mapJob(raw: RemoteOKJob): NormalizedJob {
  const title = raw.position || '';
  const company = raw.company || 'Unknown';
  const description = stripHtml(raw.description || '');
  const normTitle = normalizeTitle(title);
  const slug = companySlug(company);
  const location = raw.location || 'Remote';
  const tags = normalizeTags(raw.tags || []);
  const requirements = extractListItems(raw.description || '');
  const salary = parseSalary(
    raw.salary_min && raw.salary_max
      ? `$${raw.salary_min} - $${raw.salary_max}`
      : undefined
  );

  return {
    id: `remoteok_${raw.id}`,
    source: 'remoteok',
    external_id: String(raw.id),
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
    remote_type: detectRemoteType(location),
    work_type: 'remote',
    salary_min: raw.salary_min ?? salary.min,
    salary_max: raw.salary_max ?? salary.max,
    salary_currency: salary.currency || 'USD',
    salary_display: salary.display || (raw.salary_min ? `$${raw.salary_min.toLocaleString()} - $${(raw.salary_max || raw.salary_min).toLocaleString()}` : ''),
    seniority: extractSeniority(title),
    url: raw.url || `https://remoteok.com/remote-jobs/${raw.id}`,
    logo: raw.company_logo || null,
    created_at: raw.date || new Date(raw.epoch * 1000).toISOString(),
    fetched_at: new Date().toISOString(),
    dedupe_hash: generateDedupeHash(slug, normTitle, location),
    requirements,
    active: true,
  };
}

export const remoteokAdapter: SourceAdapter = {
  source: 'remoteok',
  async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
    try {
      const res = await fetch('/api/remoteok/api', {
        headers: { 'User-Agent': 'JobMatch/1.0' },
      });
      if (!res.ok) throw new Error(`RemoteOK API error: ${res.status}`);
      const data = await res.json();
      // First element is metadata/legal notice, skip it
      const jobs: RemoteOKJob[] = Array.isArray(data) ? data.slice(1) : [];
      return jobs.filter(j => j.position).map(mapJob);
    } catch (err) {
      console.error('[RemoteOK] Fetch failed:', err);
      return [];
    }
  },
};
