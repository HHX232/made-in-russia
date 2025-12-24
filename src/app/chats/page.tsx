import {Suspense} from 'react'
import {ChatsPage} from '@/components/pages/ChatsPage/ChatsPage'

export default function ChatsRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatsPage />
    </Suspense>
  )
}
