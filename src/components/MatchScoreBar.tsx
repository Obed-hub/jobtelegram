interface MatchScoreBarProps {
  score: number;
  size?: 'sm' | 'md';
}

export function MatchScoreBar({ score, size = 'md' }: MatchScoreBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className={`match-bar ${height} w-full`}>
      <div className={`match-bar-fill ${height}`} style={{ width: `${score}%` }} />
    </div>
  );
}
