'use client'
import dynamic from 'next/dynamic'
const AdminPanel = dynamic(() => import('@/components/pages/AdminPanel/AdminPanel'), {ssr: false})

export default function AdsPage() {
  return <AdminPanel />
}
