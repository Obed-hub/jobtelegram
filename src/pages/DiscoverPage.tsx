import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchExplanation } from '@/components/MatchExplanation';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  CheckCircle2, X, Heart, ExternalLink, Sparkles, ThumbsUp, 
  ThumbsDown, RefreshCw, Globe, Share2, ShieldCheck 
} from 'lucide-react';
import { ProgressSwipeCard } from '@/components/ProgressSwipeCard';
import { BonusPlatforms } from '@/components/BonusPlatforms';
import { UpgradeCard } from '@/components/UpgradeCard';
import { LIMITS } from '@/config/limits';

export default function DiscoverPage() {
  const { 
    matchedJobs, profile, profileComplete, saveJob, skipJob, 
    getCurrentJob, recordFeedback, syncJobs, isSyncing, 
    incrementDailySwipes, markJobAsSeen, checkLimit,
    isHighSignalFilterActive, setHighSignalFilter
  } = useApp();
  const navigate = useNavigate();
  const currentJob = getCurrentJob();

  // Mark job as seen when it's the current one
  useEffect(() => {
    if (currentJob?.id) {
      markJobAsSeen(currentJob.id);
    }
  }, [currentJob?.id, markJobAsSeen]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'jobs' | 'cv'>('jobs');
  
  // Track if they've swiped past the intro card in this session
  const [hasSwipedIntro, setHasSwipedIntro] = useState(() => {
    return sessionStorage.getItem('gigspark_intro_swiped') === 'true';
  });

  const handleSwipeCheck = (action: () => void) => {
    incrementDailySwipes();
    action();
  };


  if (!profileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-3xl mb-6 mx-auto glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-3 gradient-text">Welcome to GigSpark</h1>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto">
            Set up your profile to discover AI-matched opportunities tailored just for you.
          </p>
        </motion.div>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/profile')}
          className="gradient-bg px-8 py-3.5 rounded-xl font-semibold text-primary-foreground glow hover:opacity-90 transition-opacity"
        >
          Create Profile
        </motion.button>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border shadow-xl rounded-2xl p-8 w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5 relative">
            <span className="text-2xl">🔍</span>
            {isSyncing && (
              <div className="absolute inset-0 border-2 border-primary rounded-2xl animate-ping opacity-20"></div>
            )}
          </div>
          <h2 className="text-xl font-bold mb-3">You're all caught up!</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            We've searched all our sources and didn't find any more matches for your current profile. New jobs are added throughout the day!
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={syncJobs}
              disabled={isSyncing}
              className="w-full py-3 rounded-xl gradient-bg text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 glow hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Finding new matches...' : 'Refresh Feed'}
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="w-full py-2.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
            >
              Update Profile
            </button>
          </div>
          <UpgradeCard className="mt-8 shadow-none border-border" />
        </motion.div>

        <div className="w-full max-w-lg mt-8">
          <BonusPlatforms />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 safe-bottom">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Discover</h1>
          <p className="text-xs text-muted-foreground">{matchedJobs.length} matches found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncJobs}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing' : 'Sync'}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Matched</span>
          </div>
          {profile?.isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600">Premium Feed</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Premium Filter Toggle */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <button
          onClick={() => {
            if (!profile?.isPremium) {
              setUpgradeReason('jobs');
              setShowUpgradeModal(true);
              return;
            }
            setHighSignalFilter(!isHighSignalFilterActive);
            toast(isHighSignalFilterActive ? 'Filter disabled' : 'Remote USD/GBP filter active', {
              icon: <Globe className="w-4 h-4 text-primary" />
            });
          }}
          className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border ${
            isHighSignalFilterActive
              ? 'bg-primary border-primary text-primary-foreground shadow-lg glow'
              : 'bg-card border-border text-muted-foreground hover:border-primary/40'
          }`}
        >
          <Globe className={`w-3.5 h-3.5 ${isHighSignalFilterActive ? 'animate-pulse' : ''}`} />
          High-Signal (USD/GBP)
          {!profile?.isPremium && (
            <div className="ml-1 px-1.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span className="text-[10px] text-amber-500 uppercase font-black letter-spacing-tight">PRO</span>
            </div>
          )}
        </button>
        
        {isHighSignalFilterActive && matchedJobs.length === 0 && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-muted-foreground italic font-medium"
          >
            No USD/GBP remote roles found currently...
          </motion.p>
        )}
      </div>

      <div className="relative h-[calc(100vh-16rem)]">
        <AnimatePresence mode="popLayout">
          {!hasSwipedIntro ? (
            <ProgressSwipeCard 
              key="intro-card"
              profile={profile || {}}
              onUpgrade={() => {
                setUpgradeReason('jobs');
                setShowUpgradeModal(true);
              }}
              onSwipe={() => {
                setHasSwipedIntro(true);
                sessionStorage.setItem('gigspark_intro_swiped', 'true');
                toast.success('Search started!');
              }}
            />
          ) : (
            <SwipeCard
              key={currentJob.id}
              job={currentJob}
              onSwipeLeft={() => {
                handleSwipeCheck(() => {
                  recordFeedback(currentJob.id, 'skipped');
                  skipJob();
                  toast('Skipped');
                });
              }}
              onSwipeRight={() => {
                handleSwipeCheck(() => {
                  recordFeedback(currentJob.id, 'saved');
                  saveJob(currentJob);
                  skipJob();
                  toast.success('Saved!');
                });
              }}
              onTap={() => navigate(`/job/${currentJob.id}`)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => {
            if (!hasSwipedIntro) {
              setHasSwipedIntro(true);
              sessionStorage.setItem('gigspark_intro_swiped', 'true');
              return;
            }
            handleSwipeCheck(() => {
              recordFeedback(currentJob.id, 'skipped');
              skipJob();
              toast('Skipped');
            });
          }}
          className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          onClick={() => {
            if (!hasSwipedIntro) {
              setHasSwipedIntro(true);
              sessionStorage.setItem('gigspark_intro_swiped', 'true');
              return;
            }
            navigate(`/job/${currentJob.id}`);
          }}
          className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-accent/10 hover:border-accent/30 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => {
            if (!hasSwipedIntro) return; // Share doesn't make sense for intro
            const shareData = {
              title: currentJob.title,
              text: `Check out this job: ${currentJob.title} at ${currentJob.company}`,
              url: window.location.origin + `/job/${currentJob.id}`
            };
            if (navigator.share) {
              navigator.share(shareData).catch(console.error);
            } else {
              navigator.clipboard.writeText(shareData.url);
              toast.success('Link copied to clipboard');
            }
          }}
          className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => {
            if (!hasSwipedIntro) {
              setHasSwipedIntro(true);
              sessionStorage.setItem('gigspark_intro_swiped', 'true');
              toast.success('Search started!');
              return;
            }
            handleSwipeCheck(() => {
              recordFeedback(currentJob.id, 'relevant');
              saveJob(currentJob);
              skipJob();
              toast.success('Saved!');
            });
          }}
          className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center glow hover:opacity-90 transition-opacity"
        >
          <Heart className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="mt-12 pb-8" />

      <UpgradeModal isOpen={showUpgradeModal} onOpenChange={setShowUpgradeModal} reason={upgradeReason} />
    </div>
  );
}
