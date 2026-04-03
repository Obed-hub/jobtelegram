import React from 'react';
import { Sparkles, CheckCircle2, ChevronRight, Lock, Zap, Gauge, Globe, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LIMITS } from '@/config/limits';
import { UpgradeModal } from './UpgradeModal';

interface UpgradeCardProps {
  className?: string;
  title?: string;
  description?: string;
  showToggle?: boolean;
}

export function UpgradeCard({ className = '', title, description }: UpgradeCardProps) {
  const { profile, upgradeToPremium } = useApp();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  if (profile?.isPremium) {
    return (
      <div className={`glass-card rounded-2xl p-6 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden ${className}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
        <div className="flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold gradient-text">Premium Active</h3>
            <p className="text-xs text-muted-foreground">You have unlimited access to all features.</p>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    { icon: <Zap className="w-4 h-4 text-primary" />, label: 'Unlimited Swipes', desc: `Beyond 3 jobs/day` },
    { icon: <Sparkles className="w-4 h-4 text-purple-500" />, label: 'AI CV Tailoring', desc: 'Perfect fits every time' },
    { icon: <Globe className="w-4 h-4 text-accent" />, label: 'Hidden Gigs', desc: '50+ exclusive networks' },
    { icon: <ShieldCheck className="w-4 h-4 text-success" />, label: 'Private Jobs', desc: 'Exclusive hidden roles' },
  ];

  return (
    <>
      <div className={`glass-card rounded-2xl p-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden group hover:border-primary/50 transition-all duration-500 ${className}`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl -mr-24 -mt-24 rounded-full group-hover:bg-primary/20 transition-colors" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center glow">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{title || 'Unlock GigSpark Pro'}</h3>
              <p className="text-xs text-muted-foreground">{description || 'Get the ultimate job search advantage'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col gap-1 p-2.5 rounded-xl bg-muted/50 border border-border/50 group-hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-2">
                  {f.icon}
                  <span className="text-[11px] font-bold">{f.label}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full relative group/btn overflow-hidden rounded-xl gradient-bg p-[1px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <div className="w-full bg-background/10 backdrop-blur-md rounded-xl py-3 px-4 flex items-center justify-center gap-2 group-hover/btn:bg-transparent transition-colors">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="font-bold text-white text-sm tracking-wide">
                Upgrade Now for ${LIMITS.PREMIUM_PRICE}/mo
              </span>
              <ChevronRight className="w-4 h-4 text-white opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
            </div>
          </button>

          <p className="text-[10px] text-center text-muted-foreground mt-3 italic opacity-70">
            Billed monthly. Cancel anytime (powered by flutterwave).
          </p>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason="jobs"
      />
    </>
  );
}
