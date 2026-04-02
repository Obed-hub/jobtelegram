/**
 * Normalization utilities for job data.
 * Used by all source adapters and the matching engine.
 */

/** Normalize a job title: lowercase, strip noise */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(m\/f\/d\)/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/[,.:;!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Create a URL-safe slug from company name */
export function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Tokenize a location string into searchable tokens */
export function tokenizeLocation(location: string): string[] {
  if (!location) return [];
  const lower = location.toLowerCase();
  const tokens = new Set<string>();

  // Detect remote signals
  if (/\bremote\b/.test(lower)) tokens.add('remote');
  if (/\bglobal\b|\bworldwide\b|\banywhere\b/.test(lower)) {
    tokens.add('remote');
    tokens.add('worldwide');
  }

  // Detect regions
  const regionMap: Record<string, string[]> = {
    'europe': ['eu', 'europe', 'european', 'emea'],
    'us': ['us', 'usa', 'united states', 'north america', 'americas'],
    'uk': ['uk', 'united kingdom', 'britain', 'england'],
    'asia': ['asia', 'apac', 'asia-pacific'],
    'africa': ['africa'],
    'latam': ['latam', 'latin america', 'south america'],
  };

  for (const [region, patterns] of Object.entries(regionMap)) {
    if (patterns.some(p => lower.includes(p))) tokens.add(region);
  }

  // Extract city/country names (basic)
  const parts = lower
    .replace(/[()]/g, '')
    .split(/[,/·•|]/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s !== 'remote');
  parts.forEach(p => tokens.add(p));

  return Array.from(tokens);
}

/** Detect remote type from location and work type strings */
export function detectRemoteType(location: string, workType?: string): 'remote' | 'hybrid' | 'onsite' | 'unknown' {
  const combined = `${location} ${workType || ''}`.toLowerCase();
  if (/\bremote\b/.test(combined)) return 'remote';
  if (/\bhybrid\b/.test(combined)) return 'hybrid';
  if (/\bon.?site\b|\bin.?office\b/.test(combined)) return 'onsite';
  return 'unknown';
}

/** Detect work type from various source fields */
export function detectWorkType(type?: string, tags?: string[]): 'remote' | 'freelance' | 'contract' | 'full-time' | 'part-time' | 'unknown' {
  const combined = `${type || ''} ${(tags || []).join(' ')}`.toLowerCase();
  if (/\bfreelance\b/.test(combined)) return 'freelance';
  if (/\bcontract\b/.test(combined)) return 'contract';
  if (/\bpart.?time\b/.test(combined)) return 'part-time';
  if (/\bfull.?time\b/.test(combined)) return 'full-time';
  if (/\bremote\b/.test(combined)) return 'remote';
  return 'unknown';
}

/** Extract seniority from title or description */
export function extractSeniority(text: string): 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null {
  const lower = text.toLowerCase();
  if (/\bprincipal\b|\bstaff\b/.test(lower)) return 'principal';
  if (/\blead\b|\barchitect\b|\bhead of\b/.test(lower)) return 'lead';
  if (/\bsenior\b|\bsr\.?\b/.test(lower)) return 'senior';
  if (/\bjunior\b|\bjr\.?\b|\bintern\b|\bentry.?level\b/.test(lower)) return 'junior';
  if (/\bmid.?level\b|\bintermediate\b/.test(lower)) return 'mid';
  return null;
}

/** Parse salary strings into structured data */
export function parseSalary(salaryStr?: string): {
  min: number | null;
  max: number | null;
  currency: string | null;
  display: string;
} {
  if (!salaryStr) return { min: null, max: null, currency: null, display: '' };

  const display = salaryStr.trim();

  // Detect currency
  let currency: string | null = null;
  if (/\$|usd/i.test(display)) currency = 'USD';
  else if (/€|eur/i.test(display)) currency = 'EUR';
  else if (/£|gbp/i.test(display)) currency = 'GBP';

  // Extract numbers
  const numbers = display.match(/[\d,]+\.?\d*/g);
  if (!numbers || numbers.length === 0) return { min: null, max: null, currency, display };

  const parsed = numbers.map(n => {
    let val = parseFloat(n.replace(/,/g, ''));
    // If value looks like it's in thousands shorthand (e.g. 120k)
    if (val < 1000 && /k/i.test(display)) val *= 1000;
    return val;
  });

  return {
    min: parsed[0] ?? null,
    max: parsed[1] ?? parsed[0] ?? null,
    currency,
    display,
  };
}

/** Create a truncated description (first ~200 chars at sentence boundary) */
export function shortDescription(desc: string, maxLen = 200): string {
  if (!desc) return '';
  const clean = desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastDot = cut.lastIndexOf('.');
  return lastDot > maxLen * 0.5 ? cut.slice(0, lastDot + 1) : cut + '…';
}

/** Strip HTML tags from description */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // Unescape common entities first so we can catch escaped tags
  let clean = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return clean
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract list items from HTML as an array of strings */
export function extractListItems(html: string): string[] {
  if (!html) return [];
  const matches = html.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (!matches) return [];
  return matches.map(m => stripHtml(m).trim()).filter(s => s.length > 0);
}
