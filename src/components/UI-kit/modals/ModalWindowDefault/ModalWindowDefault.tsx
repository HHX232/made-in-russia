'use client'
import {FC, ReactNode, useEffect} from 'react'
import {createPortal} from 'react-dom'
import styles from './ModalWindowDefault.module.scss'

interface IModalWindowDefaultProps {
  children: ReactNode
  isOpen: boolean
  onClose: (e: React.MouseEvent) => void
  extraClass?: string
}

const ModalWindowDefault: FC<IModalWindowDefaultProps> = ({children, isOpen, onClose, extraClass}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null
  const onBackClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('onBackClick')
    onClose(e)
  }
  return createPortal(
    <div className={`${styles.modal__window__default__back} ${extraClass}`} onClick={onBackClick}>
      <div className={`${styles.modal__inner}`} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modal__header}`}>
          <button className={`${styles.modal__header__close__button}`} onClick={(e) => onClose(e)}>
            <svg
              className={`${styles.modal__header__close__button__svg}`}
              width='24'
              height='25'
              viewBox='0 0 24 25'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M19.001 5.49988L5.00098 19.4999M5.00098 5.49988L19.001 19.4999'
                stroke='#141416'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.getElementById('modal_portal')!
  )
}

export default ModalWindowDefault
