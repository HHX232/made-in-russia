import {CSSProperties, FC, ReactNode} from 'react'
import styles from './StringDescriptionGroup.module.scss'

type TItemFontSize = '14' | '15' | '16' | '17' | '18' | '20' | '22' | '23' | '24' | '25'
type TItemTitleFontSize = '14' | '15' | '16' | '17' | '18' | '20' | '22' | '23' | '24' | '25'

type TListGap = '5' | '10' | '15' | '20'

interface IDescrItem {
  title: string
  value: string
}

interface IStringDescriptionGroupProps {
  titleMain?: string | ReactNode
  items: IDescrItem[]
  extraListClass?: string
  extraBoxClass?: string
  extraListStyle?: CSSProperties
  elementsFontSize?: TItemFontSize
  listGap?: TListGap
  titleFontSize?: TItemTitleFontSize
  item__extra__class?: string
}
const StringDescriptionGroup: FC<IStringDescriptionGroupProps> = ({
  // titleMain,
  items,
  extraBoxClass,
  extraListClass,
  extraListStyle,
  elementsFontSize = '15',
  // titleFontSize = '24',
  listGap = '5',
  item__extra__class
}) => {
  return (
    <div className={`${styles.descr__box} ${extraBoxClass}`}>
      {/* <h4 className={`fontInstrument ${styles.descr__title} ${styles[`titleFontSize_${titleFontSize}`]}`}>
        {titleMain}
      </h4> */}
      <ul
        style={extraListStyle}
        className={`${styles.descr__list} ${styles[`list__gap_${listGap}`]} ${extraListClass}`}
      >
        {items.map((el, i) => (
          <li className={`${styles.descr__list__item} ${item__extra__class}`} key={i}>
            <p className={`${styles.element__title} ${styles[`element__def__font_${elementsFontSize}`]}`}>{el.title}</p>
            <span className={styles.dotted__line}></span>
            <p
              className={`${styles.element__value} ${styles.element__value__right} ${styles[`element__def__font_${elementsFontSize}`]}`}
            >
              {el.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StringDescriptionGroup
