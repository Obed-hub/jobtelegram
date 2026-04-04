export interface ScoreWeights {
  primaryRole: number;
  coreSkills: number;
  optionalSkills: number;
  experience: number;
  workType: number;
  location: number;
  recency: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  primaryRole: 0.35,
  coreSkills: 0.30,
  optionalSkills: 0.10,
  experience: 0.10,
  workType: 0.05,
  location: 0.05,
  recency: 0.05,
};

export interface UserProfile {
  role: string;
  normalizedRole: string;
  primaryKeywords: string[];
  coreSkills: string[];
  optionalSkills: string[];
  excludedKeywords: string[];
  experience_level: 'junior' | 'mid' | 'senior';
  years: number;
  workTypes: ('remote' | 'freelance' | 'full-time' | 'contract' | 'part-time')[];
  locationPreferences: string[];
  bio: string;
  inferredTags: string[];
  synonymMap: Record<string, string[]>;
  scoreWeights: ScoreWeights;
  matchThreshold: number;
  cvText?: string;
  isPremium?: boolean;
  dailyJobsSwiped?: number;
  dailyCvFits?: number;
  dailyAiAnalysisCount?: number;
  dailyInterviewCount?: number;
  lastActivityDate?: string;
  joinedAt?: string;
}

export interface StructuredCv {
  name: string;
  title: string;
  years_experience: string;
  location: string;
  email: string;
  phone: string;
  portfolio: string;
  linkedin: string;
  target_role: string;
  skills: string[];
  tools: string[];
  technologies: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    location: string;
    achievements: string[];
  }[];
  projects: {
    name: string;
    description: string;
    impact: string;
    tools: string[];
  }[];
  education: string[];
  certifications: string[];
  achievements: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  type: 'remote' | 'freelance' | 'contract' | 'full-time' | 'part-time';
  apply_url: string;
  logo: string;
  posted: string;
  requirements: string[];
  source?: string;
  dedupe_hash?: string;
  isPremium?: boolean;
}

export type MatchLabel = 'strong' | 'good' | 'partial' | 'weak';

export interface MatchBreakdown {
  primaryRoleScore: number;
  coreSkillScore: number;
  optionalSkillScore: number;
  experienceScore: number;
  workTypeScore: number;
  locationScore: number;
  recencyScore: number;
  blockedByExclusion: boolean;
  exclusionHits: string[];
}

export interface MatchedJob extends Job {
  matchScore: number;
  matchLabel: MatchLabel;
  matchedSkills: string[];
  missingSkills: string[];
  matchExplanation: string;
  aiInsight: string;
  breakdown: MatchBreakdown;
  strongSignals: string[];
}

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'rejected' | 'offer';
export type FeedbackAction = 'relevant' | 'not_relevant' | 'saved' | 'applied' | 'skipped';

export interface TrackedApplication {
  job: MatchedJob;
  status: ApplicationStatus;
  savedAt: string;
  appliedAt?: string;
  notes?: string;
}

export interface UserFeedback {
  jobId: string;
  action: FeedbackAction;
  timestamp: string;
}
