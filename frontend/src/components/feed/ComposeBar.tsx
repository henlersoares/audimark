'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, PenLine } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import Avatar from '@/components/ui/Avatar'
import ReviewFromFeedModal from '@/components/feed/ReviewFromFeedModal'

interface ComposeBarProps {
  onSuccess?: () => void
}

export default function ComposeBar({ onSuccess }: ComposeBarProps) {
  const { user } = useAuthStore()
  const [showReviewModal, setShowReviewModal] = useState(false)

  return (
    <>
      <div style={{ padding: '12px 20px', borderBottom: '0.5px solid #161616', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user && <Avatar username={user.username} avatarUrl={user.avatarUrl} />}
          <div
            onClick={() => setShowReviewModal(true)}
            style={{
              flex: 1, background: '#141414', border: '0.5px solid #222',
              borderRadius: '20px', padding: '8px 14px', fontSize: '13px',
              color: '#555', cursor: 'pointer',
            }}
          >
            O que você está ouvindo?
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', paddingLeft: '42px' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowReviewModal(true)}
            style={{
              background: '#1d4ed8', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '7px 14px', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '6px',
            }}
          >
            <Star size={13} /> Fazer avaliação
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'transparent', color: '#60a5fa',
              border: '0.5px solid #1d4ed844', borderRadius: '6px',
              padding: '7px 14px', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <PenLine size={13} /> Publicação
          </motion.button>
        </div>
      </div>

      {showReviewModal && (
        <ReviewFromFeedModal
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false)
            onSuccess?.()
          }}
        />
      )}
    </>
  )
}