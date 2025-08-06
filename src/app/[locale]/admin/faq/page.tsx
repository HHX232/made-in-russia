import AdminPanel from '@/components/pages/AdminPanel/AdminPanel'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
export const metadata = {
  title: 'Admin - users',
  ...NO_INDEX_PAGE
}
export default function TranslatesPage() {
  return <AdminPanel />
}
