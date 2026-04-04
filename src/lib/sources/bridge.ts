/**
 * Bridge between NormalizedJob (from aggregator) and Job (used by matching engine).
 */
import { NormalizedJob } from '@/types/normalized-job';
import { Job } from '@/types/job';

/** Convert NormalizedJob → Job for the matching engine */
export function normalizedToJob(nj: NormalizedJob): Job {
  // Map posted date to relative string
  const posted = getRelativeTime(nj.created_at);

  return {
    id: nj.id,
    title: nj.title,
    company: nj.company,
    location: nj.location,
    salary: nj.salary_display || '',
    description: nj.description,
    skills: nj.skills_inferred.length > 0 ? nj.skills_inferred : nj.tags,
    type: (() => {
      if (nj.work_type !== 'unknown') return nj.work_type as Job['type'];
      const loc = nj.location.toLowerCase();
      const remoteKeywords = ['remote', 'anywhere', 'global', 'remote-first', 'flexible location', 'distributed'];
      if (remoteKeywords.some(k => loc.includes(k))) return 'remote';
      return 'full-time'; // Default to full-time if a physical location is present without remote keywords
    })(),
    apply_url: nj.url,
    logo: nj.logo || getSourceEmoji(nj.source),
    posted,
    requirements: nj.requirements || [],
    source: nj.source,
    dedupe_hash: nj.dedupe_hash,
  };
}

function getSourceEmoji(source: string): string {
  const map: Record<string, string> = {
    remotive: '🌍',
    arbeitnow: '🇩🇪',
    remoteok: '💻',
    greenhouse: '🌱',
    lever: '🔗',
    hacker_news: '📰',
    mock: '🎯',
  };
  return map[source] || '📋';
}

function getRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return 'recently';
  }
}
