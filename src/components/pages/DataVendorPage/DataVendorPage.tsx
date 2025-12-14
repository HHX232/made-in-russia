import {FC} from 'react'
import styles from './DataVendorPage.module.scss'

// "id": 12345,
//   "role": "User",
//   "email": "user@example.com",
//   "login": "john_doe",
//   "phoneNumber": "+79123456789",
//   "region": "Moscow, Russia",
//   "registrationDate": "2025-05-04T09:17:20.767615Z",

interface IDataVendorPageProps {
  vendorData: {
    id: number
    role: string
    email: string
    login: string
    phoneNumber: string
    region: string
    registrationDate: string
  }
}

const DataVendorPage: FC<IDataVendorPageProps> = ({vendorData}) => {
  return <div className={`${styles.data__vendor__page} container`}>{vendorData.id}</div>
}

export default DataVendorPage
