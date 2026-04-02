import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: string;
  matched?: boolean;
  className?: string;
}

export function SkillBadge({ skill, matched, className }: SkillBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
      matched
        ? 'bg-success/10 text-success border border-success/20'
        : 'bg-muted text-muted-foreground border border-border',
      className
    )}>
      {matched && '✓ '}{skill}
    </span>
  );
}
