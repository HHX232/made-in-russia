import {FC} from 'react'
import styles from './StarButtonUI.module.scss'
import star from '@/assets/images/star.svg'
import Link from 'next/link'
import Image from 'next/image'

const StarButtonUI: FC = () => {
  return (
    <Link href={'favorites'}>
      <Image className={`${styles.star_image}`} width={22} height={22} src={star} alt='link to favorites' />
    </Link>
  )
}

export default StarButtonUI
