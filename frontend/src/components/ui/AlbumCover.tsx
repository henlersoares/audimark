import Image from 'next/image'

interface AlbumCoverProps {
  coverUrl?: string
  title: string
  size?: number | string
  borderRadius?: number
}

export default function AlbumCover({ coverUrl, title, size = 56, borderRadius = 4 }: AlbumCoverProps) {
  const isFullWidth = size === '100%'

  if (!coverUrl) {
    return (
      <div style={{
        width: isFullWidth ? '100%' : size,
        aspectRatio: '1 / 1',
        borderRadius,
        background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
        flexShrink: 0,
      }} />
    )
  }

  if (isFullWidth) {
    return (
      <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius, overflow: 'hidden', position: 'relative' }}>
        <Image
          src={coverUrl}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="300px"
        />
      </div>
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