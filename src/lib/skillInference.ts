/**
 * Dictionary-based skill inference engine.
 * Extracts skills from job title, description, and tags.
 * Structured so AI-based extraction can be layered on top later.
 */

/** Skill patterns: canonical name → regex patterns to detect */
const SKILL_PATTERNS: [string, RegExp][] = [
  // Languages
  ['JavaScript', /\bjavascript\b|\bjs\b(?!on)/i],
  ['TypeScript', /\btypescript\b|\bts\b/i],
  ['Python', /\bpython\b/i],
  ['Java', /\bjava\b(?!script)/i],
  ['Go', /\bgolang\b|\bgo\b(?:\s+(?:lang|developer|engineer))/i],
  ['Rust', /\brust\b/i],
  ['Ruby', /\bruby\b/i],
  ['PHP', /\bphp\b/i],
  ['C#', /\bc#\b|\.net\b|dotnet\b/i],
  ['Scala', /\bscala\b/i],
  ['Kotlin', /\bkotlin\b/i],
  ['Swift', /\bswift\b/i],
  ['Elixir', /\belixir\b/i],
  ['SQL', /\bsql\b/i],

  // Frontend
  ['React', /\breact\b(?![\s-]*native)/i],
  ['React Native', /\breact[\s-]*native\b/i],
  ['Vue', /\bvue\b(?:\.?js)?\b/i],
  ['Angular', /\bangular\b(?!js)/i],
  ['Next.js', /\bnext\.?js\b|\bnext\b(?:\s+js)/i],
  ['Nuxt', /\bnuxt\b/i],
  ['Svelte', /\bsvelte\b/i],
  ['Redux', /\bredux\b/i],
  ['Tailwind', /\btailwind\b/i],
  ['CSS', /\bcss3?\b/i],
  ['HTML', /\bhtml5?\b/i],
  ['Sass', /\bsass\b|\bscss\b/i],
  ['Webpack', /\bwebpack\b/i],
  ['Vite', /\bvite\b/i],
  ['Framer Motion', /\bframer[\s-]*motion\b/i],

  // Backend
  ['Node.js', /\bnode\.?js\b|\bnode\b/i],
  ['Express', /\bexpress\b(?:\.?js)?/i],
  ['Django', /\bdjango\b/i],
  ['Flask', /\bflask\b/i],
  ['FastAPI', /\bfastapi\b/i],
  ['Rails', /\brails\b|\bruby\s+on\s+rails\b/i],
  ['Spring', /\bspring\b(?:\s+boot)?/i],
  ['GraphQL', /\bgraphql\b/i],
  ['REST API', /\brest\b(?:\s*api)?/i],
  ['gRPC', /\bgrpc\b/i],

  // Databases
  ['PostgreSQL', /\bpostgres(?:ql)?\b|\bpsql\b/i],
  ['MySQL', /\bmysql\b/i],
  ['MongoDB', /\bmongo(?:db)?\b/i],
  ['Redis', /\bredis\b/i],
  ['DynamoDB', /\bdynamo\s*db\b/i],
  ['Elasticsearch', /\belastic\s*search\b/i],
  ['SQLite', /\bsqlite\b/i],

  // Cloud & DevOps
  ['AWS', /\baws\b|\bamazon\s+web\s+services\b/i],
  ['GCP', /\bgcp\b|\bgoogle\s+cloud\b/i],
  ['Azure', /\bazure\b/i],
  ['Docker', /\bdocker\b/i],
  ['Kubernetes', /\bkubernetes\b|\bk8s\b/i],
  ['Terraform', /\bterraform\b/i],
  ['CI/CD', /\bci\s*\/?\s*cd\b/i],
  ['Linux', /\blinux\b/i],
  ['Ansible', /\bansible\b/i],

  // Data & ML
  ['Machine Learning', /\bmachine\s+learning\b|\bml\b/i],
  ['TensorFlow', /\btensor\s*flow\b/i],
  ['PyTorch', /\bpytorch\b/i],
  ['Pandas', /\bpandas\b/i],
  ['Spark', /\bspark\b|\bpyspark\b/i],
  ['Airflow', /\bairflow\b/i],
  ['dbt', /\bdbt\b/i],

  // Design
  ['Figma', /\bfigma\b/i],
  ['Sketch', /\bsketch\b/i],
  ['Adobe XD', /\badobe\s*xd\b/i],

  // Tools & Other
  ['Git', /\bgit\b(?!hub|lab)/i],
  ['GitHub', /\bgithub\b/i],
  ['Jira', /\bjira\b/i],
  ['Agile', /\bagile\b|\bscrum\b/i],
  ['Microservices', /\bmicroservices?\b/i],
  ['Serverless', /\bserverless\b/i],
  ['WebSockets', /\bwebsockets?\b/i],
  ['Testing', /\btdd\b|\bjest\b|\bcypress\b|\bplaywright\b|\btesting\b/i],
  ['Firebase', /\bfirebase\b/i],
  ['Supabase', /\bsupabase\b/i],
  ['WordPress', /\bwordpress\b/i],
  ['WooCommerce', /\bwoocommerce\b/i],
  ['Stripe', /\bstripe\b/i],
];

/**
 * Extract skills from text (title + description + tags).
 * Returns deduplicated canonical skill names.
 */
export function inferSkills(
  title: string,
  description: string,
  tags: string[] = []
): string[] {
  const combined = `${title} ${description} ${tags.join(' ')}`;
  const found = new Set<string>();

  for (const [skill, pattern] of SKILL_PATTERNS) {
    if (pattern.test(combined)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

/**
 * Normalize a list of raw tags into canonical skill names.
 * Falls through to the original tag if no pattern matches.
 */
export function normalizeTags(tags: string[]): string[] {
  const result = new Set<string>();

  for (const tag of tags) {
    let matched = false;
    for (const [skill, pattern] of SKILL_PATTERNS) {
      if (pattern.test(tag)) {
        result.add(skill);
        matched = true;
        break;
      }
    }
    if (!matched && tag.trim().length > 1) {
      result.add(tag.trim());
    }
  }

  return Array.from(result);
}
