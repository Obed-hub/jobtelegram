import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchedJob } from '@/types/job';
import { MatchScoreBar } from './MatchScoreBar';
import { SkillBadge } from './SkillBadge';
import { MatchExplanation } from './MatchExplanation';
import { Sparkles, MapPin, Banknote, Building2, ShieldCheck } from 'lucide-react';

interface SwipeCardProps {
  job: MatchedJob;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
}

export const SwipeCard = forwardRef<HTMLDivElement, SwipeCardProps>(
  ({ job, onSwipeLeft, onSwipeRight, onTap }, ref) => {
    return (
      <motion.div
        ref={ref}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) onSwipeRight();
          else if (info.offset.x < -100) onSwipeLeft();
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ x: 300, opacity: 0, rotate: 20, transition: { duration: 0.3 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={onTap}
      >
        <div className="glass-card rounded-2xl h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-2xl">
                {job.logo}
              </div>
              <div className="flex items-center gap-2">
                <MatchExplanation job={job} compact />
                {job.isPremium && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Premium Match</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">{job.matchScore}%</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground leading-tight mb-1">{job.title}</h2>
            <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.company}</span>
              {job.source && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 capitalize">{job.source}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" />{job.salary}</span>
            </div>

            <MatchScoreBar score={job.matchScore} />
          </div>

          {/* Skills */}
          <div className="px-6 pb-4 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills Match</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.matchedSkills.map(s => <SkillBadge key={s} skill={s} matched />)}
              {job.missingSkills.slice(0, 3).map(s => <SkillBadge key={s} skill={s} />)}
            </div>

            {/* Strong Signals */}
            {job.strongSignals.length > 0 && (
              <div className="rounded-xl bg-success/5 border border-success/10 p-3 mb-3">
                <p className="text-[11px] font-semibold text-success mb-1">Why it matched:</p>
                {job.strongSignals.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-xs text-success/80">✔ {s}</p>
                ))}
              </div>
            )}

            {/* AI Insight */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.aiInsight}</p>
            </div>
          </div>

          {/* Swipe hints */}
          <div className="px-6 pb-5 flex justify-between text-xs text-muted-foreground/50">
            <span>← Skip</span>
            <span className="text-primary/50">Tap for details</span>
            <span>Save →</span>
          </div>
        </div>
      </motion.div>
    );
  }
);

SwipeCard.displayName = 'SwipeCard';
