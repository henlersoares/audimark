interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const scoreColors: Record<number, string> = {
  1: '#b91c1c',
  2: '#c2410c',
  3: '#b45309',
  4: '#a16207',
  5: '#4d7c0f',
  6: '#15803d',
  7: '#0f766e',
  8: '#0e7490',
  9: '#1d4ed8',
  10: '#1e3a8a',
}

function getScoreColor(score: number): string {
  const rounded = Math.round(score)
  return scoreColors[Math.min(Math.max(rounded, 1), 10)]
}

function formatScore(score: number): string {
  if (score === 10) return '10'
  return score.toFixed(1).replace('.', ',')
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const sizes = {
    sm: { fontSize: '11px', padding: '1px 6px' },
    md: { fontSize: '13px', padding: '2px 8px' },
    lg: { fontSize: '18px', padding: '4px 12px' },
  }

  return (
    <span
      style={{
        background: getScoreColor(score),
        color: '#fff',
        fontWeight: 700,
        borderRadius: '3px',
        display: 'inline-block',
        fontFamily: 'Inter, sans-serif',
        ...sizes[size],
      }}
    >
      {formatScore(score)}
    </span>
  )
}