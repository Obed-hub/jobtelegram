import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ApplicationStatus } from '@/types/job';
import { Briefcase, Building2, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '@/components/UpgradeModal';

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  saved: { label: 'Saved', color: 'bg-muted text-muted-foreground' },
  applied: { label: 'Applied', color: 'bg-accent/20 text-accent' },
  interview: { label: 'Interview', color: 'bg-primary/20 text-primary' },
  rejected: { label: 'Rejected', color: 'bg-destructive/20 text-destructive' },
  offer: { label: 'Offer', color: 'bg-success/20 text-success' },
};

const statusOrder: ApplicationStatus[] = ['offer', 'interview', 'applied', 'saved', 'rejected'];

export default function ApplicationsPage() {
  const { savedJobs, updateApplicationStatus, profile } = useApp();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const applications = savedJobs.filter(s => s.status !== 'saved');

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Applications</h1>
          <p className="text-xs text-muted-foreground">{applications.length} tracked</p>
        </div>
      </div>

      <div 
        onClick={() => {
          if (profile?.isPremium) {
            navigate('/networks');
          } else {
            setShowUpgradeModal(true);
          }
        }}
        className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors group relative overflow-hidden flex items-center justify-between"
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
        <div className="relative z-10">
          <h2 className="text-sm font-bold flex items-center gap-1.5 mb-1 text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Hidden Gig Networks
          </h2>
          <p className="text-xs text-muted-foreground leading-snug max-w-[260px]">Find exclusive, high-paying alternative freelance platforms.</p>
        </div>
        <ChevronRight className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity relative z-10 shrink-0" />
      </div>

      {/* Quick add from saved */}
      {savedJobs.filter(s => s.status === 'saved').length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mark as Applied</p>
          <div className="space-y-2">
            {savedJobs.filter(s => s.status === 'saved').map(({ job }) => (
              <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
                <span className="text-lg">{job.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
                <button
                  onClick={() => updateApplicationStatus(job.id, 'applied')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium gradient-bg text-primary-foreground"
                >
                  Applied
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-muted-foreground">No applications tracked</p>
          <p className="text-xs text-muted-foreground mt-1">Save jobs and mark them as applied to track here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)).map(({ job, status }) => (
            <div key={job.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3 cursor-pointer" onClick={() => navigate(`/job/${job.id}`)}>
                <span className="text-xl">{job.logo}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">{job.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</p>
                </div>
                <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold', statusConfig[status].color)}>
                  {statusConfig[status].label}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {statusOrder.filter(s => s !== 'saved').map(s => (
                  <button
                    key={s}
                    onClick={() => updateApplicationStatus(job.id, s)}
                    className={cn(
                      'px-2 py-1 rounded-md text-[10px] font-medium transition-colors',
                      status === s ? statusConfig[s].color : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        reason="networks" 
      />
    </div>
  );
}
