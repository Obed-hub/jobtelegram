import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserProfile, MatchedJob, TrackedApplication, ApplicationStatus, UserFeedback, FeedbackAction, Job } from '@/types/job';
import { SyncResult, NormalizedJob } from '@/types/normalized-job';
import { mockJobs } from '@/data/mockJobs';
import { matchJobs } from '@/lib/matching';
import { aggregateJobs, AggregationResult } from '@/lib/sources/aggregator';
import { normalizedToJob } from '@/lib/sources/bridge';
import { auth, googleProvider, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { LIMITS, LimitAction } from '@/config/limits';

interface AppState {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  profile: UserProfile | null;
  matchedJobs: MatchedJob[];
  savedJobs: TrackedApplication[];
  currentJobIndex: number;
  profileComplete: boolean;
  feedbackLog: UserFeedback[];
  syncLogs: SyncResult[];
  isSyncing: boolean;
  totalFetched: number;
  duplicatesRemoved: number;
  jobPool: Job[];
  skippedIds: Set<string>;
  seenIds: Set<string>;
  setProfile: (profile: UserProfile) => void;
  saveJob: (job: MatchedJob) => void;
  removeJob: (jobId: string) => void;
  updateApplicationStatus: (jobId: string, status: ApplicationStatus) => void;
  nextJob: () => void;
  skipJob: () => void;
  markJobAsSeen: (jobId: string) => void;
  getCurrentJob: () => MatchedJob | null;
  recordFeedback: (jobId: string, action: FeedbackAction) => void;
  allMatchedJobs: MatchedJob[];
  userAvatarUrl: string;
  syncJobs: () => Promise<void>;
  incrementDailySwipes: () => void;
  incrementDailyCvFits: () => void;
  incrementDailyAiAnalysis: () => void;
  incrementDailyInterviewPrep: () => void;
  checkLimit: (action: LimitAction) => boolean;
  upgradeToPremium: () => void;
  isHighSignalFilterActive: boolean;
  setHighSignalFilter: (active: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [allMatchedJobs, setAllMatchedJobs] = useState<MatchedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<TrackedApplication[]>(() => {
    try {
      const stored = localStorage.getItem('savedJobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('skippedIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [seenIds, setSeenIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('seenIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    } catch (err) {
      console.error('Failed to save savedJobs to localStorage', err);
    }
  }, [savedJobs]);

  React.useEffect(() => {
    try {
      localStorage.setItem('skippedIds', JSON.stringify(Array.from(skippedIds)));
      localStorage.setItem('seenIds', JSON.stringify(Array.from(seenIds)));
    } catch (err) {
      console.error('Failed to save IDs to localStorage', err);
    }
  }, [skippedIds, seenIds]);
  const [feedbackLog, setFeedbackLog] = useState<UserFeedback[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncResult[]>([]);
  const [isHighSignalFilterActive, setIsHighSignalFilterActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);
  const [jobPool, setJobPool] = useState<Job[]>(mockJobs);
  const [userAvatarUrl, setUserAvatarUrl] = useState('');

  // Use a ref to capture current profile/savedJobs without re-triggering auth useEffect
  const stateRef = React.useRef({ profile, savedJobs, skippedIds, seenIds });
  React.useEffect(() => {
    stateRef.current = { profile, savedJobs, skippedIds, seenIds };
  }, [profile, savedJobs, skippedIds, seenIds]);

  // Helper to persist data to Firestore
  const persist = useCallback(async (uid: string, data: any) => {
    try {
      // Remove any undefined values which cause Firestore to throw errors
      const sanitizedData = JSON.parse(JSON.stringify(data));
      await setDoc(doc(db, 'users', uid), sanitizedData, { merge: true });
      console.log('[Firestore] Data persisted successfully');
    } catch (err) {
      console.error('[Firestore] Persist failed:', err);
      toast.error('Failed to sync data with cloud');
    }
  }, []);

  // Listen for auth changes AND assign random avatar
  React.useEffect(() => {
    // Auth & Data Persistence
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        toast.info(`Welcome back, ${currentUser.displayName || 'User'}!`);
        // Load persistent data
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.profile) {
              const now = new Date().toDateString();
              if (data.profile.lastActivityDate !== now) {
                // New day reset
                const resetProfile = {
                  ...data.profile,
                  dailyJobsSwiped: 0,
                  dailyCvFits: 0,
                  dailyAiAnalysisCount: 0,
                  dailyInterviewCount: 0,
                  lastActivityDate: now
                };
                setProfileState(resetProfile);
                persist(currentUser.uid, { profile: resetProfile });
              } else {
                setProfileState(data.profile);
              }
            }
            if (data.savedJobs) setSavedJobs(data.savedJobs);
            if (data.skippedIds) setSkippedIds(new Set(data.skippedIds));
            if (data.seenIds) setSeenIds(new Set(data.seenIds));
          } else {
            // If no doc exists but we have local state, save it as the new profile
            const { profile: currentProfile, savedJobs: currentSaved, skippedIds: currentSkipped } = stateRef.current;
            if (currentProfile || currentSaved.length > 0) {
              await persist(currentUser.uid, {
                profile: currentProfile,
                savedJobs: currentSaved,
                skippedIds: Array.from(currentSkipped),
                seenIds: Array.from(stateRef.current.seenIds)
              });
            }
          }
        } catch (err) {
          console.error('[Firestore] Error loading user doc:', err);
        }
      }
    });

    // Random Avatar Fallback
    const randomNum = Math.floor(Math.random() * 61) + 1;
    setUserAvatarUrl(`/avatar/Number=${randomNum}.png`);

    return () => unsubscribe();
  }, [persist]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to log in with Google');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const syncJobs = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result: AggregationResult = await aggregateJobs({ 
        useMockFallback: true,
        profile: profile || undefined
      });
      const convertedJobs = result.jobs.map(normalizedToJob);
      setJobPool(convertedJobs);
      setSyncLogs(result.syncLogs);
      setTotalFetched(result.totalFetched);
      setDuplicatesRemoved(result.duplicatesRemoved);

      // Re-match if profile exists
      if (profile) {
        const matched = matchJobs(profile, convertedJobs);
        // Initial filter by seenIds to avoid already viewed jobs on sync
        const unseen = matched.filter(j => !seenIds.has(j.id));
        setAllMatchedJobs(unseen);
        setCurrentJobIndex(0);
      }
    } catch (err) {
      console.error('[Sync] Failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [profile, seenIds]);

  // Automatically fetch jobs once on app mount
  React.useEffect(() => {
    syncJobs();
  }, []); // Only once on mount

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    const matched = matchJobs(p, jobPool);
    // Initial filter by seenIds to avoid already viewed jobs on profile update
    const unseen = matched.filter(j => !seenIds.has(j.id));
    setAllMatchedJobs(unseen);
    setCurrentJobIndex(0);
    
    // Persist
    if (user) persist(user.uid, { profile: p });
  }, [jobPool, user, persist, seenIds]);

  const saveJob = useCallback((job: MatchedJob) => {
    setSavedJobs(prev => {
      if (prev.some(s => s.job.id === job.id)) return prev;
      const next: TrackedApplication[] = [...prev, { job, status: 'saved' as ApplicationStatus, savedAt: new Date().toISOString() }];
      if (user) persist(user.uid, { savedJobs: next });
      return next;
    });
  }, [user, persist]);

  const removeJob = useCallback((jobId: string) => {
    setSavedJobs(prev => {
      const next = prev.filter(s => s.job.id !== jobId);
      if (user) persist(user.uid, { savedJobs: next });
      return next;
    });
  }, [user, persist]);

  const updateApplicationStatus = useCallback((jobId: string, status: ApplicationStatus) => {
    setSavedJobs(prev => {
      const next = prev.map(s =>
        s.job.id === jobId
          ? { ...s, status, ...(status === 'applied' ? { appliedAt: new Date().toISOString() } : {}) }
          : s
      );
      if (user) persist(user.uid, { savedJobs: next });
      return next;
    });
  }, [user, persist]);

  const recordFeedback = useCallback((jobId: string, action: FeedbackAction) => {
    setFeedbackLog(prev => {
      const next = [...prev, { jobId, action, timestamp: new Date().toISOString() }];
      if (user) persist(user.uid, { feedbackLog: next });
      return next;
    });
  }, [user, persist]);

  const availableJobs = allMatchedJobs.filter(j => 
    !skippedIds.has(j.id) && 
    !(j.dedupe_hash && skippedIds.has(j.dedupe_hash)) && 
    !savedJobs.some(s => s.job.id === j.id || (j.dedupe_hash && s.job.dedupe_hash === j.dedupe_hash))
  );

  const isHighSignal = (job: MatchedJob) => {
    const isRemote = job.type === 'remote' || job.location.toLowerCase().includes('remote');
    const hasGlobalCurrency = /[\$£]|USD|GBP/i.test(job.salary);
    return isRemote && hasGlobalCurrency;
  };

  const filteredJobs = isHighSignalFilterActive 
    ? availableJobs.filter(isHighSignal)
    : availableJobs;

  const updateUsage = useCallback((action: LimitAction) => {
    setProfileState(prev => {
      if (!prev) return prev;
      const now = new Date().toDateString();
      const isNewDay = prev.lastActivityDate !== now;
      
      const keyMap: Record<LimitAction, keyof UserProfile> = {
        DAILY_SWIPES: 'dailyJobsSwiped',
        DAILY_CV_FITS: 'dailyCvFits',
        DAILY_AI_INSIGHTS: 'dailyAiAnalysisCount',
        DAILY_INTERVIEW_PREP: 'dailyInterviewCount'
      };

      const key = keyMap[action];
      const currentVal = isNewDay ? 1 : (Number(prev[key]) || 0) + 1;
      
      const next = { 
        ...prev, 
        [key]: currentVal, 
        lastActivityDate: now,
        ...(isNewDay ? {
          dailyJobsSwiped: action === 'DAILY_SWIPES' ? 1 : 0,
          dailyCvFits: action === 'DAILY_CV_FITS' ? 1 : 0,
          dailyAiAnalysisCount: action === 'DAILY_AI_INSIGHTS' ? 1 : 0,
          dailyInterviewCount: action === 'DAILY_INTERVIEW_PREP' ? 1 : 0,
        } : {})
      };
      
      if (user) persist(user.uid, { profile: next });
      return next;
    });
  }, [user, persist]);

  const incrementDailySwipes = useCallback(() => updateUsage('DAILY_SWIPES'), [updateUsage]);
  const incrementDailyCvFits = useCallback(() => updateUsage('DAILY_CV_FITS'), [updateUsage]);
  const incrementDailyAiAnalysis = useCallback(() => updateUsage('DAILY_AI_INSIGHTS'), [updateUsage]);
  const incrementDailyInterviewPrep = useCallback(() => updateUsage('DAILY_INTERVIEW_PREP'), [updateUsage]);

  const checkLimit = useCallback((action: LimitAction) => {
    if (!profile) return false;
    if (profile.isPremium) return false;
    
    // Check if daily reset is needed
    const now = new Date().toDateString();
    if (profile.lastActivityDate !== now) return false;

    const currentUsage = {
      DAILY_SWIPES: profile.dailyJobsSwiped || 0,
      DAILY_CV_FITS: profile.dailyCvFits || 0,
      DAILY_AI_INSIGHTS: profile.dailyAiAnalysisCount || 0,
      DAILY_INTERVIEW_PREP: profile.dailyInterviewCount || 0,
    }[action] || 0;

    return currentUsage >= LIMITS.FREE[action];
  }, [profile]);

  const upgradeToPremium = useCallback(() => {
    setProfileState(prev => {
      if (!prev) return prev;
      const next = { ...prev, isPremium: true };
      if (user) persist(user.uid, { profile: next });
      return next;
    });
    // This is fired inside the payment success handler usually so toast is fine outside
    toast.success("Welcome to Premium! Unlimited access unlocked.");
  }, [user, persist]);

  const nextJob = useCallback(() => {
    setCurrentJobIndex(prev => Math.min(prev + 1, availableJobs.length - 1));
  }, [availableJobs.length]);

  const skipJob = useCallback(() => {
    const job = availableJobs[currentJobIndex];
    if (job) {
      setSkippedIds(prev => {
        const next = new Set(prev).add(job.id);
        if (job.dedupe_hash) next.add(job.dedupe_hash);
        if (user) {
          persist(user.uid, { skippedIds: Array.from(next) });
        }
        return next;
      });
    }
  }, [availableJobs, currentJobIndex, user, persist]);

  const markJobAsSeen = useCallback((jobId: string) => {
    setSeenIds(prev => {
      if (prev.has(jobId)) return prev;
      const next = new Set(prev).add(jobId);
      if (user) persist(user.uid, { seenIds: Array.from(next) });
      return next;
    });
  }, [user, persist]);

  const getCurrentJob = useCallback(() => {
    return availableJobs[0] || null;
  }, [availableJobs]);

  return (
    <AppContext.Provider value={{
      user,
      loginWithGoogle,
      logout,
      profile,
      matchedJobs: filteredJobs,
      savedJobs,
      currentJobIndex,
      profileComplete: !!profile,
      feedbackLog,
      syncLogs,
      isSyncing,
      totalFetched,
      duplicatesRemoved,
      jobPool,
      skippedIds,
      seenIds,
      setProfile,
      saveJob,
      removeJob,
      updateApplicationStatus,
      nextJob,
      skipJob,
      markJobAsSeen,
      getCurrentJob,
      recordFeedback,
      allMatchedJobs,
      userAvatarUrl,
      syncJobs,
      incrementDailySwipes,
      incrementDailyCvFits,
      incrementDailyAiAnalysis,
      incrementDailyInterviewPrep,
      checkLimit,
      upgradeToPremium,
      isHighSignalFilterActive,
      setHighSignalFilter: setIsHighSignalFilterActive
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
