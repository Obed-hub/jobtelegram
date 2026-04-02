/**
 * Hacker News "Who is Hiring" job source adapter.
 * API: Uses Algolia search to find comments from the latest hiring threads.
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  shortDescription, stripHtml,
} from '@/lib/normalize';
import { inferSkills } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

interface HNComment {
  objectID: string;
  comment_text: string;
  created_at: string;
  author: string;
}

function mapJob(raw: HNComment): NormalizedJob | null {
  const fullText = stripHtml(raw.comment_text || '');
  if (fullText.length < 50) return null; // Skip very short comments

  // Heuristic for HN "Who is Hiring" posts (first line usually contains metadata)
  const lines = fullText.split('\n');
  const firstLine = lines[0].trim();
  const parts = firstLine.split('|').map(p => p.trim());
  
  const company = parts[0] || 'Unknown HN Startup';
  const title = parts.length > 1 ? parts[1] : 'Software Engineer';
  const location = parts.length > 2 ? parts[2] : 'Remote';
  
  const normTitle = normalizeTitle(title);
  const slug = companySlug(company);
  const description = fullText;

  return {
    id: `hn_${raw.objectID}`,
    source: 'hacker_news',
    external_id: raw.objectID,
    title: title.length > 100 ? title.substring(0, 97) + '...' : title,
    normalized_title: normTitle,
    company,
    company_slug: slug,
    department: null,
    description,
    short_description: shortDescription(description),
    tags: ['hacker-news', 'startup'],
    skills_inferred: inferSkills(title, description),
    location,
    location_tokens: tokenizeLocation(location),
    remote_type: 'remote', // We query for "remote" specifically
    work_type: 'full-time',
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    salary_display: '',
    seniority: 'mid',
    url: `https://news.ycombinator.com/item?id=${raw.objectID}`,
    logo: null,
    created_at: raw.created_at || new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    dedupe_hash: generateDedupeHash(slug, normTitle, location),
    requirements: [],
    active: true,
  };
}

export const hackerNewsAdapter: SourceAdapter = {
  source: 'hacker_news',
  async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
    try {
      // Fetch latest "Who is Hiring" comments containing "remote"
      const res = await fetch(
        '/api/hn/api/v1/search_by_date?tags=comment,author_whoishiring&query=remote&hitsPerPage=60'
      );
      if (!res.ok) throw new Error(`HN API error: ${res.status}`);
      
      const data = await res.json();
      const hits: HNComment[] = data.hits || [];
      
      return hits
        .map(mapJob)
        .filter((job): job is NormalizedJob => job !== null);
    } catch (err) {
      console.error('[HackerNews] Fetch failed:', err);
      return [];
    }
  },
};
