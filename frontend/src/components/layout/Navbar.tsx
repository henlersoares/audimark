'use client'

import { motion } from 'framer-motion'
import { Bell, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        background: '#0d0d0d',
        borderBottom: '0.5px solid #1f1f1f',
        padding: '0 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '52px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '24px',
      }}
    >
      <Link href="/feed" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'Playfair Display, serif',
          color: '#fff',
          letterSpacing: '0.04em',
        }}>
          <span style={{ color: '#1d4ed8' }}>A</span>udimark
        </span>
      </Link>

      {/* Barra de pesquisa centralizada */}
      <div
        onClick={() => router.push('/search')}
        style={{
          flex: 1,
          maxWidth: '480px',
          background: '#141414',
          border: '0.5px solid #2a2a2a',
          borderRadius: '20px',
          padding: '7px 14px',
          fontSize: '13px',
          color: '#555',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <Search size={13} color="#444" />
        Pesquise um artista ou álbum
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Bell size={18} color="#555" style={{ cursor: 'pointer' }} />
        </motion.div>

        <Link href={`/profile/${user?.username}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#1d4ed822',
              border: '1px solid #1d4ed844',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '11px',
              color: '#60a5fa',
              fontWeight: 600,
            }}
          >
            {user?.username?.slice(0, 2).toUpperCase() ?? <User size={12} />}
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  )
}