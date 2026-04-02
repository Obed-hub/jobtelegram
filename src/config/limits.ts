/**
 * Centralized configuration for AI usage limits and premium pricing.
 */
export const LIMITS = {
  FREE: {
    DAILY_SWIPES: 3,
    DAILY_CV_FITS: 1,
    DAILY_AI_INSIGHTS: 1,
    DAILY_INTERVIEW_PREP: 2,
  },
  PREMIUM_PRICE: 2.99,
};

export type LimitAction = keyof typeof LIMITS.FREE;
