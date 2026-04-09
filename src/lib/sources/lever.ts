/**
 * Lever job board adapter.
 * Fetches jobs from a Lever company postings page.
 * API: https://api.lever.co/v0/postings/{company}?mode=json
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, detectWorkType, extractSeniority,
  shortDescription, stripHtml, extractListItems,
} from '@/lib/normalize';
import { inferSkills } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

interface LeverJob {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl: string;
  categories: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
    allLocations?: string[];
  };
  descriptionPlain?: string;
  description?: string;
  createdAt: number;
  workplaceType?: string;
}

function mapJob(raw: LeverJob, companyName: string): NormalizedJob {
  const title = raw.text || '';
  const company = companyName;
  const description = raw.descriptionPlain || stripHtml(raw.description || '');
  const normTitle = normalizeTitle(title);
  const slug = companySlug(company);
  const location = raw.categories?.location ||
    raw.categories?.allLocations?.join(', ') || '';
  const department = raw.categories?.department ||
    raw.categories?.team || null;
  const requirements = extractListItems(raw.description || '');

  return {
    id: `lever_${companySlug(companyName)}_${raw.id.slice(0, 12)}`,
    source: 'lever',
    external_id: raw.id,
    title,
    normalized_title: normTitle,
    company,
    company_slug: slug,
    department,
    description,
    short_description: shortDescription(description),
    tags: [],
    skills_inferred: inferSkills(title, description),
    location,
    location_tokens: tokenizeLocation(location),
    remote_type: detectRemoteType(location, raw.workplaceType),
    work_type: detectWorkType(raw.categories?.commitment),
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    salary_display: '',
    seniority: extractSeniority(title),
    url: raw.hostedUrl || raw.applyUrl || '',
    logo: null,
    created_at: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    dedupe_hash: generateDedupeHash(slug, normTitle, location),
    requirements,
    active: true,
  };
}

/**
 * Create a Lever adapter for a specific company.
 * @param companySlugParam - Lever company slug (e.g. 'netflix', 'twitch')
 * @param companyName - Display name
 */
export function createLeverAdapter(companySlugParam: string, companyName: string): SourceAdapter {
  return {
    source: 'lever',
    async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
      try {
        const res = await fetch(
          `/api/lever/v0/postings/${companySlugParam}?mode=json`
        );
        if (res.status === 404 || res.status === 403) {
          // Silent skip for private/stale boards to reduce console noise
          return [];
        }
        if (!res.ok) throw new Error(`Lever API error for ${companySlugParam}: ${res.status}`);
        const data = await res.json();
        const jobs: LeverJob[] = Array.isArray(data) ? data : [];
        return jobs.map(j => mapJob(j, companyName));
      } catch (err) {
        console.error(`[Lever/${companySlugParam}] Fetch failed:`, err);
        return [];
      }
    },
  };
}

/** Default Lever boards to fetch from */
export const DEFAULT_LEVER_BOARDS = [
  // --- Big Tech & Platforms ---
  { slug: 'atlassian', name: 'Atlassian' },
  { slug: 'palantir', name: 'Palantir' },
  { slug: 'plaid', name: 'Plaid' },
  { slug: 'netflix', name: 'Netflix' },
  { slug: 'twitch', name: 'Twitch' },
  { slug: 'robinhood', name: 'Robinhood' },
  { slug: 'lyft', name: 'Lyft' },
  { slug: 'doordash', name: 'DoorDash' },
  { slug: 'instacart', name: 'Instacart' },
  { slug: 'cruise', name: 'Cruise' },
];
