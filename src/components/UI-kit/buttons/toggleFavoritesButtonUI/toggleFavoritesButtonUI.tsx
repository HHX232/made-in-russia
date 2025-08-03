'use client'
import {FC, useState} from 'react'
import styles from './toggleFavoritesButtonUI.module.scss'

interface ToggleFavoritesButtonUIProps {
  extraClass?: string
  extraStyles?: React.CSSProperties
  isActive?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const ToggleFavoritesButtonUI: FC<ToggleFavoritesButtonUIProps> = ({
  extraClass = '',
  extraStyles = {},
  isActive: initialActive = false,
  onClick
}) => {
  const [isActive, setIsActive] = useState(initialActive)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsActive(!isActive)
    onClick?.(e)
  }

  return (
    <button
      id='cy-toggle-favorites-button'
      className={`${styles.button} ${extraClass}`}
      data-active={isActive}
      style={extraStyles}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClick(e)
      }}
      aria-label={isActive ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M12 1.75L9.06255 8.95L1.30005 9.525L7.25005 14.55L5.38755 22.1L12 18M12 1.75L14.9376 8.95L22.7 9.525L16.7501 14.55L18.6126 22.1L12 18'
          fill={isActive ? '#AC2525' : 'white'}
          fillOpacity={isActive ? '1' : '0.5'}
          stroke='#181818'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  )
}

export default ToggleFavoritesButtonUI
