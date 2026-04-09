/**
 * Job aggregator — fetches from all sources in parallel,
 * normalizes, deduplicates, and returns unified job list.
 */
import { NormalizedJob, SourceAdapter, SyncResult } from '@/types/normalized-job';
import { UserProfile } from '@/types/job';
import { deduplicateJobs } from '@/lib/dedupe';
import { remotiveAdapter } from './remotive';
import { arbeitnowAdapter } from './arbeitnow';
import { remoteokAdapter } from './remoteok';
import { createGreenhouseAdapter, DEFAULT_GREENHOUSE_BOARDS } from './greenhouse';
import { createLeverAdapter, DEFAULT_LEVER_BOARDS } from './lever';
import { hackerNewsAdapter } from './hackerNews';
import { weworkremotelyAdapter } from './weworkremotely';
import { mockAdapter } from './mock';

/** All enabled source adapters */
function getAllAdapters(): SourceAdapter[] {
  const adapters: SourceAdapter[] = [
    remotiveAdapter,
    arbeitnowAdapter,
    remoteokAdapter,
    hackerNewsAdapter,
    weworkremotelyAdapter,
  ];

  for (const board of DEFAULT_GREENHOUSE_BOARDS) {
    adapters.push(createGreenhouseAdapter(board.slug, board.name));
  }

  for (const board of DEFAULT_LEVER_BOARDS) {
    adapters.push(createLeverAdapter(board.slug, board.name));
  }

  return adapters;
}

export interface AggregationResult {
  jobs: NormalizedJob[];
  syncLogs: SyncResult[];
  totalFetched: number;
  duplicatesRemoved: number;
}

/**
 * Fetch jobs from all sources in parallel, deduplicate, and return.
 * Falls back to mock data if all live sources fail.
 */
export async function aggregateJobs(
  options: { 
    useMockFallback?: boolean; 
    sources?: string[];
    profile?: UserProfile;
  } = {}
): Promise<AggregationResult> {
  const { useMockFallback = false, sources, profile } = options;
  const adapters = getAllAdapters().filter(
    a => !sources || sources.includes(a.source)
  );

  const syncLogs: SyncResult[] = [];
  const allJobs: NormalizedJob[] = [];

  // Fetch all sources in parallel
  const results = await Promise.allSettled(
    adapters.map(async (adapter) => {
      const start = new Date().toISOString();
      try {
        const jobs = await adapter.fetchJobs({ profile });
        syncLogs.push({
          source: adapter.source,
          started_at: start,
          finished_at: new Date().toISOString(),
          jobs_fetched: jobs.length,
          jobs_saved: jobs.length,
          duplicates_skipped: 0,
          errors: [],
        });
        return jobs;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Only log to console if it's not a common fetch error to keep console clean
        if (!msg.includes('404') && !msg.includes('Failed to fetch')) {
          console.error(`[Aggregator/${adapter.source}] Unexpected failure:`, msg);
        }
        syncLogs.push({
          source: adapter.source,
          started_at: start,
          finished_at: new Date().toISOString(),
          jobs_fetched: 0,
          jobs_saved: 0,
          duplicates_skipped: 0,
          errors: [msg],
        });
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    }
  }

  // Log summary of the sync process
  const activeSources = syncLogs.filter(l => l.jobs_fetched > 0);
  if (allJobs.length > 0) {
    console.info(`[Aggregator] Sync complete: ${allJobs.length} jobs fetched from ${activeSources.length}/${adapters.length} configured sources.`);
  } else {
    console.warn(`[Aggregator] Sync finished with 0 jobs from ${adapters.length} sources.`);
  }

  // Fallback to mock if nothing came through
  if (allJobs.length === 0 && useMockFallback) {
    const hasErrors = syncLogs.some(log => log.errors.length > 0);
    if (hasErrors) {
      console.warn('[Aggregator] All live sources failed. Using mock data as fallback.');
      console.warn('[Aggregator] Tip: If this is in production, ensure Netlify/Vercel proxies are configured for /api/* routes.');
      console.warn('[Aggregator] Tip: If this is local, check your internet connection or if the APIs are blocking the requests.');
    } else {
      console.info('[Aggregator] No jobs found from any live source. Using mock data.');
    }
    
    const mockJobs = await mockAdapter.fetchJobs({ profile });
    allJobs.push(...mockJobs);
    syncLogs.push({
      source: 'mock',
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      jobs_fetched: mockJobs.length,
      jobs_saved: mockJobs.length,
      duplicates_skipped: 0,
      errors: [],
    });
  }

  // Deduplicate
  const { unique, duplicatesRemoved } = deduplicateJobs(allJobs);

  return {
    jobs: unique,
    syncLogs,
    totalFetched: allJobs.length,
    duplicatesRemoved,
  };
}
