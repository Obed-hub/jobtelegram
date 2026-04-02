/**
 * Mock source adapter — converts existing mockJobs to NormalizedJob format.
 * Used as fallback when live APIs are unavailable (e.g. CORS in browser).
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import { mockJobs } from '@/data/mockJobs';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, extractSeniority,
  parseSalary, shortDescription,
} from '@/lib/normalize';
import { inferSkills } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

export const mockAdapter: SourceAdapter = {
  source: 'mock',
  async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
    return mockJobs.map(job => {
      const normTitle = normalizeTitle(job.title);
      const slug = companySlug(job.company);
      const salary = parseSalary(job.salary);

      return {
        id: `mock_${job.id}`,
        source: 'mock',
        external_id: job.id,
        title: job.title,
        normalized_title: normTitle,
        company: job.company,
        company_slug: slug,
        department: null,
        description: job.description,
        short_description: shortDescription(job.description),
        tags: job.skills,
        skills_inferred: inferSkills(job.title, job.description, job.skills),
        location: job.location,
        location_tokens: tokenizeLocation(job.location),
        remote_type: detectRemoteType(job.location, job.type),
        work_type: job.type,
        salary_min: salary.min,
        salary_max: salary.max,
        salary_currency: salary.currency,
        salary_display: salary.display,
        seniority: extractSeniority(job.title),
        url: job.apply_url,
        logo: job.logo,
        created_at: new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        dedupe_hash: generateDedupeHash(slug, normTitle, job.location),
        requirements: job.requirements || [],
        active: true,
      };
    });
  },
};
