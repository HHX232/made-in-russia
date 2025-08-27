import React, {useRef, useState} from 'react'
import styles from './ZoomImage.module.scss'

interface ZoomImageProps {
  src: string
  alt?: string
  zoom?: number // коэффициент увеличения
  lensSize?: number // размер квадрата (px)
  className?: string
}

const ZoomImage: React.FC<ZoomImageProps> = ({src, alt = 'zoom', zoom = 2, lensSize = 150, className = ''}) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const [lensPos, setLensPos] = useState<{x: number; y: number} | null>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return

    const rect = imgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Ограничиваем позицию внутри картинки
    const posX = Math.max(lensSize / 2, Math.min(x, rect.width - lensSize / 2))
    const posY = Math.max(lensSize / 2, Math.min(y, rect.height - lensSize / 2))

    setLensPos({x: posX, y: posY})
  }

  const handleMouseLeave = () => {
    setLensPos(null)
  }

  return (
    <div
      className={`${styles.zoomImageWrapper} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img ref={imgRef} src={src} alt={alt} className={styles.zoomImage} />

      {lensPos && (
        <div
          className={styles.zoomLens}
          style={{
            width: lensSize,
            height: lensSize,
            top: lensPos.y - lensSize / 2,
            left: lensPos.x - lensSize / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${(imgRef.current?.width || 0) * zoom}px ${(imgRef.current?.height || 0) * zoom}px`,
            backgroundPosition: `-${lensPos.x * zoom - lensSize / 2}px -${lensPos.y * zoom - lensSize / 2}px`
          }}
        />
      )}
    </div>
  )
}

export default ZoomImage
