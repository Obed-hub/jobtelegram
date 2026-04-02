export const SYNONYM_DICTIONARY: Record<string, string[]> = {
  'javascript': ['js', 'es6', 'es2015', 'ecmascript'],
  'typescript': ['ts'],
  'react': ['react.js', 'reactjs'],
  'node.js': ['node', 'nodejs', 'node js'],
  'next.js': ['nextjs', 'next', 'next js'],
  'vue': ['vue.js', 'vuejs', 'vue js'],
  'angular': ['angularjs', 'angular.js'],
  'postgresql': ['postgres', 'psql', 'pg'],
  'mongodb': ['mongo'],
  'graphql': ['gql'],
  'tailwind': ['tailwind css', 'tailwindcss'],
  'aws': ['amazon web services'],
  'gcp': ['google cloud', 'google cloud platform'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'cicd'],
  'docker': ['containers', 'containerization'],
  'kubernetes': ['k8s'],
  'python': ['py'],
  'ruby': ['rb'],
  'golang': ['go'],
  'sass': ['scss'],
  'rest api': ['rest apis', 'restful', 'rest'],
  'machine learning': ['ml'],
  'artificial intelligence': ['ai'],
  'frontend': ['front-end', 'front end'],
  'backend': ['back-end', 'back end'],
  'full-stack': ['fullstack', 'full stack'],
  'ui engineer': ['frontend engineer'],
  'devops': ['dev ops', 'dev-ops'],
  'react native': ['rn'],
  'css': ['css3'],
  'html': ['html5'],
  'redis': [],
  'figma': [],
  'sketch': [],
};

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.\-_\/]/g, '')
    .replace(/\s+/g, ' ');
}

export function expandWithSynonyms(
  terms: string[],
  customSynonyms: Record<string, string[]> = {}
): string[] {
  const merged = { ...SYNONYM_DICTIONARY };
  for (const [key, vals] of Object.entries(customSynonyms)) {
    const nk = normalizeText(key);
    merged[nk] = [...(merged[nk] || []), ...vals.map(normalizeText)];
  }

  const expanded = new Set(terms.map(normalizeText));

  for (const term of terms) {
    const nt = normalizeText(term);
    for (const [canonical, synonyms] of Object.entries(merged)) {
      const allForms = [normalizeText(canonical), ...synonyms.map(normalizeText)];
      if (allForms.includes(nt)) {
        allForms.forEach(f => expanded.add(f));
      }
    }
  }

  return Array.from(expanded);
}

export function normalizeSkill(skill: string): string {
  return normalizeText(skill);
}
