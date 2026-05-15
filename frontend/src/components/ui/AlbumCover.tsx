import Image from 'next/image'

interface AlbumCoverProps {
  coverUrl?: string
  title: string
  size?: number
  borderRadius?: number
}

export default function AlbumCover({ coverUrl, title, size = 56, borderRadius = 4 }: AlbumCoverProps) {
  if (!coverUrl) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius,
        background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
        flexShrink: 0,
      }} />
    )
  }

  return (
    <div style={{ width: size, height: size, borderRadius, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
      <Image
        src={coverUrl}
        alt={title}
        fill
        style={{ objectFit: 'cover' }}
        sizes={`${size}px`}
      />
    </div>
  )
}