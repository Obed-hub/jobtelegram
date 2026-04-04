import {
  Job, MatchedJob, UserProfile, DEFAULT_WEIGHTS,
  MatchBreakdown, MatchLabel,
} from '@/types/job';
import { normalizeText, expandWithSynonyms, normalizeSkill } from '@/lib/synonyms';

function skillsOverlap(
  userSkills: string[],
  jobSkills: string[],
  synonymMap: Record<string, string[]>
): { matched: string[]; missing: string[] } {
  const expandedUser = expandWithSynonyms(userSkills, synonymMap);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSkills) {
    if (expandedUser.includes(normalizeSkill(skill))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  return { matched, missing };
}

function primaryRoleMatch(
  primaryKeywords: string[],
  jobTitle: string,
  jobDescription: string
): number {
  if (primaryKeywords.length === 0) return 0;
  const individualScores: number[] = [];
  const normTitle = normalizeText(jobTitle);
  const normDesc = normalizeText(jobDescription);

  for (const keyword of primaryKeywords) {
    const normKw = normalizeText(keyword);
    let titleMatches = 0;
    let descOnlyMatches = 0;

    // Exact phrase match in title is highest priority
    if (normTitle.includes(normKw)) {
      titleMatches++;
    } else {
      // Check individual tokens in title
      const kwTokens = normKw.split(/\s+/).filter(t => t.length >= 3);
      const titleTokens = normTitle.split(/\s+/);
      const tokenHits = kwTokens.filter(t =>
        titleTokens.some(tt => tt.includes(t) || t.includes(tt))
      );
      if (tokenHits.length > 0) {
        titleMatches += tokenHits.length / kwTokens.length * 0.7;
      } else if (normDesc.includes(normKw)) {
        descOnlyMatches++;
      }
    }
    
    // Title matches worth more than description-only matches
    const score = (titleMatches * 3 + descOnlyMatches) / 3;
    individualScores.push(Math.min(1, score));
  }

  // Return the best match among all primary keywords
  return Math.max(0, ...individualScores);
}

function experienceMatch(userLevel: string, userYears: number, jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  const seniorKeywords = ['senior', 'lead', 'staff', 'principal', 'architect'];
  const juniorKeywords = ['junior', 'entry', 'associate', 'intern'];

  const isSeniorJob = seniorKeywords.some(k => title.includes(k));
  const isJuniorJob = juniorKeywords.some(k => title.includes(k));

  if (userLevel === 'senior' && isSeniorJob) return 1;
  if (userLevel === 'junior' && isJuniorJob) return 1;
  if (userLevel === 'mid' && !isSeniorJob && !isJuniorJob) return 1;
  if (userLevel === 'senior' && !isJuniorJob) return 0.6;
  if (userLevel === 'mid' && !isSeniorJob) return 0.7;
  if (userLevel === 'junior') return 0.4;
  return 0.3;
}

function workTypeMatch(userTypes: string[], jobType: string): number {
  if (userTypes.length === 0) return 0.5;
  if (userTypes.includes(jobType)) return 1;
  // Freelance and contract are somewhat interchangeable
  if (userTypes.includes('freelance') && jobType === 'contract') return 0.7;
  if (userTypes.includes('contract') && jobType === 'freelance') return 0.7;
  return 0.2;
}

function locationMatch(userLocations: string[], jobLocation: string): number {
  if (userLocations.length === 0) return 0.5;
  const normJob = jobLocation.toLowerCase();
  const remoteKeywords = ['remote', 'global', 'worldwide', 'anywhere', 'distributed'];
  const isRemoteFriendlyJob = remoteKeywords.some(k => normJob.includes(k));

  if (userLocations.some(l => {
    const normL = l.toLowerCase();
    return remoteKeywords.includes(normL);
  }) && isRemoteFriendlyJob) return 1;
  
  if (isRemoteFriendlyJob) return 0.9;

  for (const loc of userLocations) {
    if (normJob.includes(loc.toLowerCase())) return 1;
  }

  return 0.2;
}

function recencyScore(posted: string): number {
  const lower = posted.toLowerCase();
  if (lower.includes('1 day') || lower.includes('today')) return 1;
  if (lower.includes('2 day')) return 0.9;
  if (lower.includes('3 day')) return 0.85;
  if (lower.match(/[4-6]\s*day/)) return 0.7;
  if (lower.includes('1 week') || lower.includes('week ago')) return 0.5;
  if (lower.includes('2 week')) return 0.3;
  return 0.2;
}

function checkExclusions(
  jobTitle: string,
  jobSkills: string[],
  jobDescription: string,
  exclusions: string[]
): string[] {
  if (exclusions.length === 0) return [];
  const normTitle = normalizeText(jobTitle);
  const normDesc = normalizeText(jobDescription);
  const normSkills = jobSkills.map(normalizeText);
  const hits: string[] = [];

  for (const excl of exclusions) {
    const normExcl = normalizeText(excl);
    if (
      normTitle.includes(normExcl) ||
      normSkills.some(s => s.includes(normExcl)) ||
      normDesc.includes(normExcl)
    ) {
      hits.push(excl);
    }
  }

  return hits;
}

function getMatchLabel(score: number): MatchLabel {
  if (score >= 75) return 'strong';
  if (score >= 55) return 'good';
  if (score >= 35) return 'partial';
  return 'weak';
}

function generateStrongSignals(
  job: Job,
  breakdown: MatchBreakdown,
  matchedCoreSkills: string[],
  matchedOptionalSkills: string[],
  primaryRoleScore: number
): string[] {
  const signals: string[] = [];

  if (primaryRoleScore >= 0.7) {
    signals.push(`Title closely matches your preferred role`);
  }
  if (matchedCoreSkills.length > 0) {
    signals.push(`Core skills matched: ${matchedCoreSkills.join(', ')}`);
  }
  if (breakdown.workTypeScore >= 0.8) {
    signals.push(`Work type matches your preference`);
  }
  if (breakdown.locationScore >= 0.8) {
    signals.push(`Location aligns with your preference`);
  }
  if (breakdown.experienceScore >= 0.8) {
    signals.push(`Experience level is a fit`);
  }
  if (matchedOptionalSkills.length > 0) {
    signals.push(`Bonus skills: ${matchedOptionalSkills.join(', ')}`);
  }
  if (breakdown.recencyScore >= 0.8) {
    signals.push(`Recently posted`);
  }

  return signals;
}

function generateInsight(
  job: Job,
  matchLabel: MatchLabel,
  matchedSkills: string[],
  missingSkills: string[]
): string {
  switch (matchLabel) {
    case 'strong':
      return `Strong match! Your ${matchedSkills.slice(0, 2).join(' & ')} skills align well with ${job.company}'s needs.`;
    case 'good':
      return `Good potential at ${job.company}. You match on ${matchedSkills.length} key skills. Consider strengthening ${missingSkills[0] || 'related areas'}.`;
    case 'partial':
      return `Stretch opportunity at ${job.company}. Could be a growth role if you're willing to learn ${missingSkills.slice(0, 2).join(' & ')}.`;
    default:
      return `Different skill focus than your profile. ${job.company} may still be worth exploring.`;
  }
}

function generateExplanation(
  matchedSkills: string[],
  missingSkills: string[],
  breakdown: MatchBreakdown
): string {
  const parts: string[] = [];
  if (matchedSkills.length > 0) parts.push(`✔ Skills: ${matchedSkills.join(', ')}`);
  if (missingSkills.length > 0) parts.push(`⚠ Missing: ${missingSkills.join(', ')}`);
  if (breakdown.primaryRoleScore >= 0.7) parts.push('✔ Role aligns well');
  if (breakdown.workTypeScore >= 0.8) parts.push('✔ Work type matches');
  if (breakdown.locationScore >= 0.8) parts.push('✔ Location matches');
  if (breakdown.experienceScore >= 0.8) parts.push('✔ Experience level fits');
  return parts.join('\n');
}

export function matchJobs(profile: UserProfile, jobs: Job[]): MatchedJob[] {
  const weights = profile.scoreWeights || DEFAULT_WEIGHTS;
  const synonymMap = profile.synonymMap || {};
  const threshold = profile.matchThreshold ?? 20;

  // Combine all user skills for skill matching
  const allUserSkills = [...profile.coreSkills, ...profile.optionalSkills];
  const inferredTags = profile.inferredTags || [];
  const combinedSkills = [...new Set([...allUserSkills, ...inferredTags])];

  const scored: MatchedJob[] = [];

  for (const job of jobs) {
    // Check exclusions first
    const exclusionHits = checkExclusions(
      job.title, job.skills, job.description, profile.excludedKeywords
    );

    if (exclusionHits.length > 0) continue; // Hard filter

    // Primary role match
    const prScore = primaryRoleMatch(
      profile.primaryKeywords, job.title, job.description
    );

    // Hard filter on Work Type if specific types are selected
    if (profile.workTypes.length > 0) {
      const jobTypesMatched = profile.workTypes.includes(job.type);
      const isFreelanceContractOverlap = (profile.workTypes.includes('freelance') && job.type === 'contract') || 
                                         (profile.workTypes.includes('contract') && job.type === 'freelance');
      const isRemoteWorkTypeButLocationPhysical = profile.workTypes.includes('remote') && job.type !== 'remote';
      
      if (!jobTypesMatched && !isFreelanceContractOverlap) {
        continue; // Strictly filter out non-matching work types
      }
    }

    // Skill matching (separate core and optional)
    const { matched: coreMatched, missing: coreMissing } = skillsOverlap(
      profile.coreSkills, job.skills, synonymMap
    );
    const { matched: optMatched } = skillsOverlap(
      profile.optionalSkills, job.skills, synonymMap
    );

    const lScore = locationMatch(profile.locationPreferences, job.location);

    // Hard filter on Location if specific preferences are set
    if (profile.locationPreferences.length > 0 && lScore < 0.5) {
      continue; // Strictly filter out non-matching locations
    }

    const coreSkillScore = job.skills.length > 0
      ? coreMatched.length / job.skills.length
      : 0.5; // Neutral if no skills listed
    const optSkillScore = job.skills.length > 0
      ? optMatched.length / job.skills.length
      : 0.5;

    // Must have some relevance signal
    if (prScore === 0 && coreMatched.length === 0 && optMatched.length === 0) continue;

    const wtScore = workTypeMatch(profile.workTypes, job.type);
    const eScore = experienceMatch(profile.experience_level, profile.years, job.title);
    const rScore = recencyScore(job.posted);

    const totalScore = Math.round(
      (weights.primaryRole * prScore +
        weights.coreSkills * coreSkillScore +
        weights.optionalSkills * optSkillScore +
        weights.experience * eScore +
        weights.workType * wtScore +
        weights.location * lScore +
        weights.recency * rScore) * 100
    );

    if (totalScore < threshold) continue;

    const allMatched = [...new Set([...coreMatched, ...optMatched])];
    const allMissing = job.skills.filter(s => !allMatched.includes(s));
    const matchLabel = getMatchLabel(totalScore);

    const breakdown: MatchBreakdown = {
      primaryRoleScore: prScore,
      coreSkillScore,
      optionalSkillScore: optSkillScore,
      experienceScore: eScore,
      workTypeScore: wtScore,
      locationScore: lScore,
      recencyScore: rScore,
      blockedByExclusion: false,
      exclusionHits: [],
    };

    scored.push({
      ...job,
      matchScore: totalScore,
      matchLabel,
      matchedSkills: allMatched,
      missingSkills: allMissing,
      matchExplanation: generateExplanation(allMatched, allMissing, breakdown),
      aiInsight: generateInsight(job, matchLabel, allMatched, allMissing),
      breakdown,
      strongSignals: generateStrongSignals(job, breakdown, coreMatched, optMatched, prScore),
    });
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored;
}
