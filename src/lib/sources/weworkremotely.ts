/**
 * We Work Remotely (WWR) job source adapter.
 * RSS Feed: https://weworkremotely.com/remote-jobs.rss
 */
import { NormalizedJob, SourceAdapter } from '@/types/normalized-job';
import {
  normalizeTitle, companySlug, tokenizeLocation,
  detectRemoteType, detectWorkType, extractSeniority,
  shortDescription, stripHtml, extractListItems,
} from '@/lib/normalize';
import { inferSkills } from '@/lib/skillInference';
import { generateDedupeHash } from '@/lib/dedupe';

/**
 * Parses the WWR RSS XML into a list of NormalizedJobs.
 * Since WWR provides a standard RSS 2.0 feed, we use DOMParser.
 */
function parseWWRXml(xmlString: string): NormalizedJob[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const items = xmlDoc.querySelectorAll('item');
  const jobs: NormalizedJob[] = [];

  items.forEach((item) => {
    const rawTitle = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const descriptionHtml = item.querySelector('description')?.textContent || '';
    const category = item.querySelector('category')?.textContent || '';
    const type = item.querySelector('type')?.textContent || 'Full-Time';
    const region = item.querySelector('region')?.textContent || 'Remote';
    const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
    
    // media:content might be prefixed if the namespace is not handled automatically by querySelector
    // however, querySelector usually works or we can use getElementsByTagNameNS
    const logoMedia = item.getElementsByTagNameNS('http://search.yahoo.com/mrss', 'content')[0];
    const logo = logoMedia?.getAttribute('url') || null;

    // WWR Title format: "Company: Job Title"
    let company = 'Unknown Company';
    let title = rawTitle;

    if (rawTitle.includes(': ')) {
      const parts = rawTitle.split(': ');
      company = parts[0].trim();
      title = parts.slice(1).join(': ').trim();
    }

    const description = stripHtml(descriptionHtml);
    const normTitle = normalizeTitle(title);
    const slug = companySlug(company);
    const requirements = extractListItems(descriptionHtml);

    jobs.push({
      id: `wwr_${link.split('/').pop() || Math.random().toString(36).substring(7)}`,
      source: 'weworkremotely',
      external_id: link,
      title,
      normalized_title: normTitle,
      company,
      company_slug: slug,
      department: category,
      description,
      short_description: shortDescription(description),
      tags: [category.toLowerCase().replace(/\s+/g, '-')],
      skills_inferred: inferSkills(title, description, [category]),
      location: region,
      location_tokens: tokenizeLocation(region),
      remote_type: detectRemoteType(region, type),
      work_type: detectWorkType(type),
      salary_min: null, // WWR RSS doesn't reliably provide structured salary yet
      salary_max: null,
      salary_currency: null,
      salary_display: '',
      seniority: extractSeniority(title),
      url: link,
      logo,
      created_at: pubDate,
      fetched_at: new Date().toISOString(),
      dedupe_hash: generateDedupeHash(slug, normTitle, region),
      requirements,
      active: true,
    });
  });

  return jobs;
}

export const weworkremotelyAdapter: SourceAdapter = {
  source: 'weworkremotely',
  async fetchJobs(_options?: { profile?: any }): Promise<NormalizedJob[]> {
    try {
      const res = await fetch('/api/wwr/remote-jobs.rss');
      if (!res.ok) throw new Error(`WWR RSS error: ${res.status}`);
      
      const xmlString = await res.text();
      return parseWWRXml(xmlString);
    } catch (err) {
      console.error('[WWR] Fetch failed:', err);
      return [];
    }
  },
};
