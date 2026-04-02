/**
 * Greenhouse job board adapter.
 * Fetches jobs from a Greenhouse company board.
 * API: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, detectWorkType, extractSeniority,
  shortDescription, stripHtml, extractListItems,
} from '@/lib/normalize';
import { inferSkills } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  departments: { name: string }[];
  content: string;
  updated_at: string;
}

function mapJob(raw: GreenhouseJob, companyName: string): NormalizedJob {
  const title = stripHtml(raw.title || '');
  const company = companyName;
  const description = stripHtml(raw.content || '');
  const normTitle = normalizeTitle(title);
  const slug = companySlug(company);
  const location = raw.location?.name || '';
  const department = raw.departments?.map(d => d.name).join(', ') || null;
  const requirements = extractListItems(raw.content || '');

  return {
    id: `greenhouse_${companySlug(companyName)}_${raw.id}`,
    source: 'greenhouse',
    external_id: String(raw.id),
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
    remote_type: detectRemoteType(location),
    work_type: detectWorkType(undefined, [location, title]),
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    salary_display: '',
    seniority: extractSeniority(title),
    url: raw.absolute_url || '',
    logo: null,
    created_at: raw.updated_at || new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    dedupe_hash: generateDedupeHash(slug, normTitle, location),
    requirements,
    active: true,
  };
}

/**
 * Create a Greenhouse adapter for a specific company board.
 * @param boardSlug - The Greenhouse board slug (e.g. 'spotify', 'figma')
 * @param companyName - Display name for the company
 */
export function createGreenhouseAdapter(boardSlug: string, companyName: string): SourceAdapter {
  return {
    source: 'greenhouse',
    async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
      try {
        const res = await fetch(
          `/api/greenhouse/v1/boards/${boardSlug}/jobs?content=true`
        );
        if (res.status === 404 || res.status === 403) {
          // Some boards are private or disabled the API
          console.warn(`[Greenhouse/${boardSlug}] Board is private or disabled (Status: ${res.status})`);
          return [];
        }
        if (!res.ok) throw new Error(`Greenhouse API error for ${boardSlug}: ${res.status}`);
        const data = await res.json();
        const jobs: GreenhouseJob[] = data.jobs || [];
        return jobs.map(j => mapJob(j, companyName));
      } catch (err) {
        console.error(`[Greenhouse/${boardSlug}] Fetch failed:`, err);
        return [];
      }
    },
  };
}

/** Default Greenhouse boards to fetch from */
export const DEFAULT_GREENHOUSE_BOARDS = [
  // --- Top Tech & Market Leaders ---
  { slug: 'figma', name: 'Figma' },
  { slug: 'affirm', name: 'Affirm' },
  { slug: 'plaid', name: 'Plaid' },
  { slug: 'brex', name: 'Brex' },
  { slug: 'databricks', name: 'Databricks' },
  { slug: 'asana', name: 'Asana' },
  { slug: 'intercom', name: 'Intercom' },
  { slug: 'gusto', name: 'Gusto' },
  { slug: 'hubspot', name: 'Hubspot' },
  { slug: 'eventbriteinc', name: 'Eventbrite' },

  // --- SaaS & Modern Startups ---
  { slug: 'retool', name: 'Retool' },
  { slug: 'loom', name: 'Loom' },
  { slug: 'superhuman', name: 'Superhuman' },
  { slug: 'algolia', name: 'Algolia' },
  { slug: 'monday', name: 'Monday.com' },
  { slug: 'typeform', name: 'Typeform' },
  { slug: 'contentful', name: 'Contentful' },
  { slug: 'sentry', name: 'Sentry' },
  { slug: 'gitpod', name: 'Gitpod' },
  { slug: 'launchdarkly', name: 'LaunchDarkly' },
  { slug: 'vercel', name: 'Vercel' },
  { slug: 'supabase', name: 'Supabase' },
  { slug: 'planet', name: 'Planet' },
  { slug: 'scaleai', name: 'Scale AI' },
  { slug: 'rippling', name: 'Rippling' },
  { slug: 'benchling', name: 'Benchling' },
  { slug: 'flexport', name: 'Flexport' },

  // --- Fintech & Infra ---
  { slug: 'wise', name: 'Wise' },
  { slug: 'checkout', name: 'Checkout.com' },
  { slug: 'klarna', name: 'Klarna' },
  { slug: 'square', name: 'Square' },
  { slug: 'chime', name: 'Chime' },
  { slug: 'marqeta', name: 'Marqeta' },
  { slug: 'ramp', name: 'Ramp' },
  { slug: 'bill', name: 'Bill' },
  { slug: 'toast', name: 'Toast' },

  // --- Dev Tools & Infra ---
  { slug: 'docker', name: 'Docker' },
  { slug: 'elastic', name: 'Elastic' },
  { slug: 'hashicorp', name: 'HashiCorp' },
  { slug: 'datadog', name: 'DataDog' },
  { slug: 'newrelic', name: 'New Relic' },
  { slug: 'snowflake', name: 'Snowflake' },
  { slug: 'confluent', name: 'Confluent' },
  { slug: 'redis', name: 'Redis' },
  { slug: 'fastly', name: 'Fastly' },
  { slug: 'cloudflare', name: 'Cloudflare' },
  { slug: 'discord', name: 'Discord' }, // ⚠️ sometimes works
  { slug: 'canva', name: 'Canva' },   // ⚠️ partial support
];
