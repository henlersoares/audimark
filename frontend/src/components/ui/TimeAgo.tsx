interface TimeAgoProps {
  date: string
}

export default function TimeAgo({ date }: TimeAgoProps) {
  const now = new Date()
  const past = new Date(date)
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

  let label = ''

  if (diff < 60) label = 'agora'
  else if (diff < 3600) label = `há ${Math.floor(diff / 60)} min`
  else if (diff < 86400) label = `há ${Math.floor(diff / 3600)} horas`
  else if (diff < 172800) label = 'ontem'
  else label = past.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <span style={{ fontSize: '11px', color: '#444' }}>{label}</span>
  )
}