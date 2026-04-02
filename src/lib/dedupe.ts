/**
 * Deduplication engine for multi-source job aggregation.
 * Uses multiple hashing strategies to catch duplicate listings.
 */
import { NormalizedJob } from '@/types/normalized-job';

/**
 * Generate a deduplication hash from job data.
 * Primary: company_slug + normalized_title + location_first_token
 * This catches the same job posted across different boards.
 */
export function generateDedupeHash(
  companySlug: string,
  normalizedTitle: string,
  location: string
): string {
  const locationToken = location.toLowerCase().split(/[,/(]/)[0].trim() || 'unknown';
  const input = `${companySlug}::${normalizedTitle}::${locationToken}`;
  // Simple hash — good enough for client-side dedup
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * URL-based dedup hash as secondary strategy.
 */
export function urlDedupeHash(url: string): string {
  const clean = url.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  return `url_${Math.abs(hash).toString(36)}`;
}

/**
 * Deduplicate a list of normalized jobs.
 * Prefers jobs from sources with more data (longer descriptions).
 * Returns the deduplicated list and the count of removed duplicates.
 */
export function deduplicateJobs(jobs: NormalizedJob[]): {
  unique: NormalizedJob[];
  duplicatesRemoved: number;
} {
  const seen = new Map<string, NormalizedJob>();
  const urlSeen = new Map<string, NormalizedJob>();
  let duplicatesRemoved = 0;

  for (const job of jobs) {
    // Check by primary hash
    const existing = seen.get(job.dedupe_hash);
    if (existing) {
      // Keep the one with more data
      if (job.description.length > existing.description.length) {
        seen.set(job.dedupe_hash, job);
      }
      duplicatesRemoved++;
      continue;
    }

    // Check by URL hash
    const urlHash = urlDedupeHash(job.url);
    const existingByUrl = urlSeen.get(urlHash);
    if (existingByUrl) {
      if (job.description.length > existingByUrl.description.length) {
        // Remove old from seen and replace
        seen.delete(existingByUrl.dedupe_hash);
        seen.set(job.dedupe_hash, job);
        urlSeen.set(urlHash, job);
      }
      duplicatesRemoved++;
      continue;
    }

    seen.set(job.dedupe_hash, job);
    urlSeen.set(urlHash, job);
  }

  return {
    unique: Array.from(seen.values()),
    duplicatesRemoved,
  };
}
