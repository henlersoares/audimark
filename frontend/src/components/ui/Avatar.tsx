import Image from 'next/image'

interface AvatarProps {
  username: string
  avatarUrl?: string
  size?: number
}

export default function Avatar({ username, avatarUrl, size = 32 }: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase()

  if (avatarUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <Image src={avatarUrl} alt={username} fill style={{ objectFit: 'cover' }} sizes={`${size}px`} />
      </div>
    )
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#1d4ed822',
      border: '1px solid #1d4ed844',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.35,
      color: '#60a5fa',
      fontWeight: 600,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}