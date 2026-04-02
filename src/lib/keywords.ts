interface KeywordGroup {
  primaryKeywords: string[];
  coreSkills: string[];
  optionalSkills: string[];
  suggestedExclusions: string[];
}

const ROLE_DEFINITIONS: Record<string, KeywordGroup> = {
  frontend: {
    primaryKeywords: [
      'frontend developer', 'frontend engineer', 'react developer',
      'javascript developer', 'ui engineer', 'web developer',
      'front-end developer', 'front-end engineer',
    ],
    coreSkills: ['react', 'typescript', 'javascript', 'css', 'html'],
    optionalSkills: ['vue', 'angular', 'next.js', 'tailwind', 'sass', 'webpack', 'graphql', 'redux'],
    suggestedExclusions: ['backend', 'devops', 'firmware', 'embedded', 'data engineer', 'machine learning'],
  },
  backend: {
    primaryKeywords: [
      'backend developer', 'backend engineer', 'server engineer',
      'api developer', 'node.js developer', 'python developer',
      'back-end developer', 'back-end engineer',
    ],
    coreSkills: ['node.js', 'python', 'sql', 'rest api', 'docker'],
    optionalSkills: ['postgresql', 'mongodb', 'redis', 'graphql', 'aws', 'kubernetes', 'go'],
    suggestedExclusions: ['frontend', 'ui/ux', 'design', 'ios', 'android'],
  },
  fullstack: {
    primaryKeywords: [
      'full-stack developer', 'fullstack developer', 'full stack engineer',
      'full-stack engineer', 'software engineer',
    ],
    coreSkills: ['react', 'node.js', 'typescript', 'sql', 'rest api'],
    optionalSkills: ['next.js', 'postgresql', 'mongodb', 'docker', 'aws', 'graphql'],
    suggestedExclusions: ['firmware', 'embedded', 'data scientist', 'machine learning'],
  },
  designer: {
    primaryKeywords: [
      'ui/ux designer', 'product designer', 'ux designer', 'ui designer',
      'visual designer', 'interaction designer', 'design lead',
    ],
    coreSkills: ['figma', 'ui design', 'ux research', 'prototyping', 'design systems'],
    optionalSkills: ['sketch', 'adobe xd', 'css', 'html', 'framer'],
    suggestedExclusions: ['backend', 'devops', 'data engineer', 'firmware'],
  },
  mobile: {
    primaryKeywords: [
      'mobile developer', 'ios developer', 'android developer',
      'react native developer', 'flutter developer', 'mobile engineer',
    ],
    coreSkills: ['react native', 'typescript', 'ios', 'android'],
    optionalSkills: ['swift', 'kotlin', 'flutter', 'redux', 'firebase'],
    suggestedExclusions: ['backend', 'devops', 'firmware', 'data engineer'],
  },
  devops: {
    primaryKeywords: [
      'devops engineer', 'site reliability engineer', 'sre',
      'infrastructure engineer', 'platform engineer', 'cloud engineer',
    ],
    coreSkills: ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd'],
    optionalSkills: ['gcp', 'ansible', 'linux', 'go', 'python', 'monitoring'],
    suggestedExclusions: ['frontend', 'ui/ux', 'design', 'mobile'],
  },
  data: {
    primaryKeywords: [
      'data engineer', 'data scientist', 'ml engineer',
      'machine learning engineer', 'analytics engineer', 'data analyst',
    ],
    coreSkills: ['python', 'sql', 'machine learning', 'pandas', 'spark'],
    optionalSkills: ['tensorflow', 'pytorch', 'aws', 'airflow', 'dbt', 'tableau'],
    suggestedExclusions: ['frontend', 'ui/ux', 'design', 'mobile'],
  },
  product: {
    primaryKeywords: [
      'product manager', 'product owner', 'technical product manager',
      'senior product manager', 'group product manager',
    ],
    coreSkills: ['product strategy', 'roadmapping', 'analytics', 'stakeholder management'],
    optionalSkills: ['sql', 'figma', 'jira', 'a/b testing', 'user research'],
    suggestedExclusions: ['developer', 'engineer', 'designer', 'devops'],
  },
};

export const ALL_SUGGESTED_ROLES = Array.from(new Set(
  Object.values(ROLE_DEFINITIONS).flatMap(def => def.primaryKeywords)
)).sort();


export function generateKeywordsFromRole(role: string): KeywordGroup {
  const lower = role.toLowerCase().trim();

  // Try exact role family match
  for (const [family, definition] of Object.entries(ROLE_DEFINITIONS)) {
    if (
      lower.includes(family) ||
      definition.primaryKeywords.some(pk => lower.includes(pk) || pk.includes(lower))
    ) {
      return {
        ...definition,
        primaryKeywords: [
          lower,
          ...definition.primaryKeywords.filter(pk => pk !== lower),
        ],
      };
    }
  }

  // Fallback: extract meaningful tokens
  const words = lower.split(/\s+/).filter(w => w.length >= 3);
  return {
    primaryKeywords: [lower],
    coreSkills: [],
    optionalSkills: [],
    suggestedExclusions: [],
  };
}

export function extractBioSignals(bio: string): string[] {
  if (!bio.trim()) return [];

  const lower = bio.toLowerCase();
  const signals: string[] = [];
  const techPatterns = [
    'react', 'typescript', 'javascript', 'node', 'python', 'aws', 'docker',
    'kubernetes', 'graphql', 'rest', 'sql', 'mongodb', 'redis', 'figma',
    'next.js', 'vue', 'angular', 'flutter', 'swift', 'kotlin', 'go',
    'rust', 'java', 'c#', 'php', 'ruby', 'rails', 'django', 'flask',
    'terraform', 'ci/cd', 'agile', 'scrum', 'microservices', 'serverless',
    'machine learning', 'data science', 'analytics', 'design systems',
    'accessibility', 'performance', 'testing', 'tdd',
  ];

  for (const tech of techPatterns) {
    if (lower.includes(tech)) {
      signals.push(tech);
    }
  }

  // Seniority signals
  const seniorityPatterns = [
    { pattern: /\b(\d+)\+?\s*years?\b/i, extract: true },
    { pattern: /\bsenior\b/i, tag: 'senior-signal' },
    { pattern: /\blead\b/i, tag: 'lead-signal' },
    { pattern: /\bjunior\b/i, tag: 'junior-signal' },
    { pattern: /\bmentor/i, tag: 'senior-signal' },
  ];

  for (const { pattern, tag } of seniorityPatterns) {
    if (pattern.test(lower) && tag) {
      signals.push(tag);
    }
  }

  return [...new Set(signals)];
}

export const COMMON_LOCATIONS = [
  'Remote', 'Worldwide', 'USA', 'Europe', 'UK', 'Canada', 
  'Germany', 'Netherlands', 'Nigeria', 'Lagos', 'London', 
  'New York', 'San Francisco', 'Berlin', 'Asia', 'Africa', 'Latin America'
].sort();
