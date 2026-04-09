/**
 * Centralized configuration for AI usage limits and premium pricing.
 */
export const LIMITS = {
  FREE: {
    DAILY_SWIPES: 1000,
    DAILY_CV_FITS: 1,
    DAILY_AI_INSIGHTS: 1000,
    DAILY_INTERVIEW_PREP: 1000,
  },
  PREMIUM_PRICE: 2.99,
};

export type LimitAction = keyof typeof LIMITS.FREE;
