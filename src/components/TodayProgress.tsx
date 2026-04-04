import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Activity, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/types/job';

interface TodayProgressProps {
  profile: Partial<UserProfile>;
  onUpgrade: () => void;
  className?: string;
}

export function TodayProgress({ profile, onUpgrade, className }: TodayProgressProps) {
  const isPremium = profile.isPremium;
  
  const progressItems = [
    { 
      label: `Found ${profile.dailyJobsSwiped || 0} remote jobs`, 
      done: (profile.dailyJobsSwiped || 0) > 0,
      icon: CheckCircle2 
    },
    { 
      label: `Generated ${profile.dailyCvFits || 0} CV`, 
      done: (profile.dailyCvFits || 0) > 0,
      icon: CheckCircle2 
    },
    { 
      label: `Created ${profile.dailyAiAnalysisCount || 0} cover letter`, 
      done: (profile.dailyAiAnalysisCount || 0) > 0,
      icon: CheckCircle2 
    },
  ];

  return (
    <div className={cn(
      "glass-card rounded-3xl p-6 border-primary/10 shadow-xl shadow-primary/5 relative overflow-hidden group",
      className
    )}>
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          Today’s Progress
        </h3>
        {isPremium && (
          <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 tracking-wider">PRO Unlocked</span>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {progressItems.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
              item.done ? "text-success bg-success/10" : "text-muted-foreground/30 bg-muted"
            )}>
              <item.icon className="w-3.5 h-3.5" />
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors",
              item.done ? "text-foreground" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>

      {!isPremium && (
        <div className="pt-6 border-t border-border/50">
          <p className="text-xs font-bold text-foreground mb-3 px-1">Upgrade to unlock:</p>
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground group/item hover:text-primary transition-colors px-1">
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
              <span>50+ jobs daily</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground group/item hover:text-primary transition-colors px-1">
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
              <span>Unlimited CV optimization</span>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            Go Premium <Sparkles className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {isPremium && (
        <p className="text-[10px] text-muted-foreground text-center italic mt-2">
          Your premium status gives you unlimited access to all tools.
        </p>
      )}
    </div>
  );
}
