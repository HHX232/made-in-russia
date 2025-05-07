import {FC} from 'react'
import Link from 'next/link'
import styles from './StarButtonUI.module.scss'

interface StarButtonUIProps {
  extraClass?: string
  svgColor?: string
  width?: number
  height?: number
}

const StarButtonUI: FC<StarButtonUIProps> = ({extraClass = '', svgColor = 'white', width = 22, height = 22}) => {
  return (
    <Link href='/favorites' className={`${styles.star_link} ${extraClass}`}>
      <svg
        className={styles.star_image}
        width={width}
        height={height}
        viewBox='0 0 20 19'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M9.99994 1L7.64994 6.76L1.43994 7.22L6.19994 11.24L4.70994 17.28L9.99994 14M9.99994 1L12.3499 6.76L18.5599 7.22L13.7999 11.24L15.2899 17.28L9.99994 14'
          stroke={svgColor}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Link>
  )
}

export default StarButtonUI
