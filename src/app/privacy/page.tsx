import PrivacyPage from '@/components/pages/PrivacyPage/PrivacyPage'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Privacy'
}

export default function Privacy() {
  return <PrivacyPage />
}
