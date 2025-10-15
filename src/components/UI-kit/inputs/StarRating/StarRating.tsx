import React, {useState} from 'react'
import styles from './StarRating.module.scss'

interface StarRatingProps {
  starsCountSet: number
  setStarsCountSet: (count: number) => void
}

const StarRating: React.FC<StarRatingProps> = ({starsCountSet, setStarsCountSet}) => {
  const [hoveredStar, setHoveredStar] = useState<number>(0)

  const handleMouseEnter = (starIndex: number) => {
    setHoveredStar(starIndex)
  }

  const handleMouseLeave = () => {
    setHoveredStar(0)
  }

  const handleClick = (starIndex: number) => {
    setStarsCountSet(starIndex)
  }

  const renderStar = (starIndex: number) => {
    const isActive = hoveredStar ? starIndex <= hoveredStar : starIndex <= starsCountSet

    return (
      <button
        key={starIndex}
        className={styles.starButton}
        onMouseEnter={() => handleMouseEnter(starIndex)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(starIndex)}
        type='button'
        aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
      >
        {isActive ? (
          <svg width='24' height='22' viewBox='0 0 24 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 0L15.1811 7.6216L23.4127 8.2918L17.1471 13.6724L19.0534 21.7082L12 17.412L4.94658 21.7082L6.85288 13.6724L0.587322 8.2918L8.81891 7.6216L12 0Z'
              fill='#EEB611'
            />
          </svg>
        ) : (
          <svg width='24' height='22' viewBox='0 0 24 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 0L15.1811 7.6216L23.4127 8.2918L17.1471 13.6724L19.0534 21.7082L12 17.412L4.94658 21.7082L6.85288 13.6724L0.587322 8.2918L8.81891 7.6216L12 0Z'
              fill='#CACACA'
            />
          </svg>
        )}
      </button>
    )
  }

  return <div className={styles.starRatingContainer}>{[1, 2, 3, 4, 5].map((starIndex) => renderStar(starIndex))}</div>
}

export default StarRating
