import {FC, useState, ChangeEvent, useCallback, useMemo} from 'react'
import styles from './CreateImagesInputMinimalistic.module.scss'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'

interface CreateImagesInputMinimalisticProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  extraClass?: string
  labelText?: string
  maxFileSize?: number
  allowedTypes?: string[]
  inputId?: string
}

const CreateImagesInputMinimalistic: FC<CreateImagesInputMinimalisticProps> = ({
  onFilesChange,
  maxFiles = 10,
  extraClass = '',
  labelText,
  maxFileSize = 20 * 1024 * 1024,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  inputId = 'minimalistic-upload'
}) => {
  const t = useTranslations('CreateImagesInputMinimalistic')
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Используем переведенный текст по умолчанию, если не передан labelText
  const displayLabelText = labelText || t('defaultLabel')

  const acceptString = useMemo(() => {
    return allowedTypes.join(',')
  }, [allowedTypes])

  const isValidFileType = useCallback(
    (file: File) => {
      if (file.type === 'image/svg+xml') {
        return false
      }
      return allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '/')
          return file.type.startsWith(baseType)
        }
        return file.type === type
      })
    },
    [allowedTypes]
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      const fileArray = Array.from(selectedFiles)
      const remainingSlots = maxFiles - files.length

      if (fileArray.length > remainingSlots) {
        toast.error(
          <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>{t('fileLimitExceeded')}</strong>
            <span>{t('youCanAddMore', {remainingSlots})}</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
        return
      }

      const invalidFiles: string[] = []
      const oversizedFiles: string[] = []
      const validFiles: File[] = []
      const newUrls: string[] = []

      fileArray.forEach((file) => {
        if (!isValidFileType(file)) {
          invalidFiles.push(file.name)
        } else if (file.size > maxFileSize) {
          oversizedFiles.push(file.name)
        } else {
          validFiles.push(file)
          newUrls.push(URL.createObjectURL(file))
        }
      })

      if (invalidFiles.length > 0) {
        toast.error(
          <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>{t('uploadError')}</strong>
            <span>{t('invalidFileTypes', {fileNames: invalidFiles.join(', ')})}</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }

      if (oversizedFiles.length > 0) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024))
        toast.error(
          <div data-special-attr-for-error={true} style={{lineHeight: 1.5}}>
            <strong style={{display: 'block', marginBottom: 4}}>{t('uploadError')}</strong>
            <span>
              {t('fileSizeExceeded', {
                maxSizeMB,
                fileNames: oversizedFiles.join(', ')
              })}
            </span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }

      if (validFiles.length > 0) {
        const updatedFiles = [...files, ...validFiles]
        const updatedUrls = [...previewUrls, ...newUrls]

        setFiles(updatedFiles)
        setPreviewUrls(updatedUrls)
        onFilesChange(updatedFiles)
      }

      e.target.value = ''
    },
    [files, previewUrls, maxFiles, maxFileSize, isValidFileType, onFilesChange, t]
  )

  const handleRemove = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previewUrls[index])

      const newFiles = files.filter((_, i) => i !== index)
      const newUrls = previewUrls.filter((_, i) => i !== index)

      setFiles(newFiles)
      setPreviewUrls(newUrls)
      onFilesChange(newFiles)
    },
    [files, previewUrls, onFilesChange]
  )

  const canAddMore = files.length < maxFiles

  return (
    <div className={`${styles.wrapper} ${extraClass}`}>
      <label htmlFor={inputId} className={styles.upload__trigger}>
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M10.2754 10.1251L8.21706 12.1834C7.07539 13.3251 7.07539 15.1667 8.21706 16.3084C9.35872 17.4501 11.2004 17.4501 12.3421 16.3084L15.5837 13.0667C17.8587 10.7917 17.8587 7.09172 15.5837 4.81672C13.3087 2.54172 9.60873 2.54172 7.33372 4.81672L3.80039 8.35006C1.85039 10.3001 1.85039 13.4667 3.80039 15.4251'
            stroke='#171717'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <span className={styles.upload__text}>{displayLabelText}</span>
        {canAddMore && (
          <input
            type='file'
            id={inputId}
            accept={acceptString}
            multiple
            onChange={handleFileChange}
            className={styles.upload__input}
          />
        )}
      </label>

      {previewUrls.length > 0 && (
        <div className={styles.preview__list}>
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className={styles.preview__item}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img src={url} alt={`Preview ${index + 1}`} className={styles.preview__image} />
              {hoveredIndex === index && (
                <button className={styles.remove__button} onClick={() => handleRemove(index)} type='button'>
                  <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M1 1L13 13M1 13L13 1' stroke='white' strokeWidth='2' strokeLinecap='round' />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CreateImagesInputMinimalistic
