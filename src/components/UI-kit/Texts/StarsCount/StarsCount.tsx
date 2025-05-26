import {CSSProperties, FC, ReactNode} from 'react'
import styles from './StarsCount.module.scss'
import Image from 'next/image'

interface IStarsCount {
  count: number | string
  extraClass?: string
  extraStyle?: CSSProperties
  customArrow?: ReactNode
}
const star__svg = '/yellow__star.svg'

const StarsCount: FC<IStarsCount> = ({count, extraClass, extraStyle, customArrow}) => {
  return (
    <div className={`${styles.starsCount} ${extraClass || ''}`} style={extraStyle}>
      {customArrow ? customArrow : <Image src={star__svg} alt='star' width={19} height={18} />}
      <p className={`${styles.starsCount__text}`}>{Number(count).toFixed(1)}</p>
    </div>
  )
}

export default StarsCount
