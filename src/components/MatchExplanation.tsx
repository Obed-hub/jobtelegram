import { MatchedJob, MatchBreakdown } from '@/types/job';
import { cn } from '@/lib/utils';

interface MatchExplanationProps {
  job: MatchedJob;
  compact?: boolean;
}

const LABEL_CONFIG = {
  strong: { text: 'Strong match', className: 'bg-success/15 text-success border-success/20' },
  good: { text: 'Good match', className: 'bg-primary/15 text-primary border-primary/20' },
  partial: { text: 'Partial match', className: 'bg-warning/15 text-warning border-warning/20' },
  weak: { text: 'Weak match', className: 'bg-muted text-muted-foreground border-border' },
};

function ScoreRow({ label, score, weight }: { label: string; score: number; weight?: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-primary' : 'bg-warning')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-mono w-8 text-right text-foreground">{pct}%</span>
    </div>
  );
}

export function MatchExplanation({ job, compact }: MatchExplanationProps) {
  const config = LABEL_CONFIG[job.matchLabel];

  if (compact) {
    return (
      <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold border', config.className)}>
        {config.text}
      </span>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold border', config.className)}>
          {config.text}
        </span>
        <span className="text-sm font-bold text-foreground">{job.matchScore}%</span>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-1.5">
        <ScoreRow label="Role Match" score={job.breakdown.primaryRoleScore} />
        <ScoreRow label="Core Skills" score={job.breakdown.coreSkillScore} />
        <ScoreRow label="Optional Skills" score={job.breakdown.optionalSkillScore} />
        <ScoreRow label="Experience" score={job.breakdown.experienceScore} />
        <ScoreRow label="Work Type" score={job.breakdown.workTypeScore} />
        <ScoreRow label="Location" score={job.breakdown.locationScore} />
        <ScoreRow label="Recency" score={job.breakdown.recencyScore} />
      </div>

      {/* Strong Signals */}
      {job.strongSignals.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">Why it matched:</p>
          <div className="space-y-1">
            {job.strongSignals.map((signal, i) => (
              <p key={i} className="text-xs text-success flex items-start gap-1">
                <span>✔</span> {signal}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Missing */}
      {job.missingSkills.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">Missing:</p>
          <div className="flex flex-wrap gap-1">
            {job.missingSkills.map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
