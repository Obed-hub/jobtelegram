import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchedJob } from '@/types/job';
import { MatchScoreBar } from './MatchScoreBar';
import { SkillBadge } from './SkillBadge';
import { MatchExplanation } from './MatchExplanation';
import { Sparkles, MapPin, Banknote, Building2, ShieldCheck, Globe, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface SwipeCardProps {
  job: MatchedJob;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
}

export const SwipeCard = forwardRef<HTMLDivElement, SwipeCardProps>(
  ({ job, onSwipeLeft, onSwipeRight, onTap }, ref) => {
    const isUrl = (str: string) => {
      try {
        return str.startsWith('http') || str.startsWith('/') || str.includes('.com') || str.includes('.io');
      } catch {
        return false;
      }
    };

    const renderLogo = () => {
      if (!job.logo) return <Building2 className="w-6 h-6 text-primary-foreground/50" />;
      
      if (isUrl(job.logo)) {
        return (
          <img 
            src={job.logo} 
            alt={job.company}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random`;
            }}
          />
        );
      }

      return <span className="text-2xl select-none">{job.logo}</span>;
    };

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
        <div className="glass-card rounded-[2rem] h-full flex flex-col overflow-hidden border-white/5 shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-2">
            <div className="flex items-start justify-between mb-6">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {renderLogo()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center shadow-lg">
                   {job.source === 'remotive' ? <Globe className="w-3 h-3 text-accent" /> : <Building2 className="w-3 h-3 text-muted-foreground" />}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground animate-pulse" />
                  <span className="text-sm font-bold text-primary-foreground">{job.matchScore}%</span>
                </div>
                <MatchExplanation job={job} compact />
              </div>
            </div>

            <div className="space-y-1.5 mb-6">
              <h2 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight line-clamp-2">
                {job.title}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-lg font-semibold text-foreground/90">{job.company}</span>
                {job.isPremium && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-600 uppercase">Premium</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium truncate">{job.location}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium truncate">{job.salary || 'Competitive'}</span>
              </div>
            </div>

            <MatchScoreBar score={job.matchScore} />
          </div>

          {/* Body Content */}
          <div className="px-6 pb-4 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            <div className="mt-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Skills Match</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.matchedSkills.map(s => <SkillBadge key={s} skill={s} matched />)}
                {job.missingSkills.slice(0, 3).map(s => <SkillBadge key={s} skill={s} />)}
              </div>

              {/* Enhanced Why it Matched */}
              {job.strongSignals.length > 0 && (
                <div className="rounded-2xl bg-success/10 border border-success/20 p-4 mb-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ThumbsUp className="w-12 h-12 text-success" />
                  </div>
                  <p className="text-xs font-bold text-success mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Match Reasoning
                  </p>
                  <div className="space-y-1.5">
                    {job.strongSignals.slice(0, 3).map((s, i) => (
                      <p key={i} className="text-xs text-success/90 font-medium leading-relaxed">• {s}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight Section */}
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-primary/20">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary tracking-tight">AI Fit Score</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{job.aiInsight}"
                </p>
              </div>
            </div>
          </div>

          {/* Action Area Hint */}
          <div className="px-6 py-4 bg-gradient-to-t from-background/20 to-transparent flex justify-between items-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.1em]">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-destructive/50" />
              Left to Skip
            </div>
            <div className="text-primary/40 animate-pulse">Tap for full details</div>
            <div className="flex items-center gap-1.5">
              Right to Save
              <span className="w-1 h-1 rounded-full bg-success/50" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

SwipeCard.displayName = 'SwipeCard';
