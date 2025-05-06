import {FC} from 'react'
import styles from './StarButtonUI.module.scss'
import Link from 'next/link'
import Image from 'next/image'
const star = '/star.svg'
const StarButtonUI: FC = () => {
  return (
    <Link href={'favorites'}>
      <Image className={`${styles.star_image}`} width={22} height={22} src={star} alt='link to favorites' />
    </Link>
  )
}

export default StarButtonUI
