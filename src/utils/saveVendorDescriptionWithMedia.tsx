import {getAccessToken} from '@/services/auth/auth.helper'
import {toast} from 'sonner'

interface VendorMedia {
  id?: number
  mediaType?: string
  mimeType?: string
  url?: string
}

interface SaveVendorMediaParams {
  newFiles: File[] // Новые загруженные файлы
  existingImages: string[] // Существующие изображения (URLs)
  allExistingMedia: VendorMedia[] // Полная информация о существующих медиа
  currentLanguage: string
  t: (key: string) => string // Функция перевода
}

interface SaveVendorMediaResult {
  success: boolean
  error?: string
}

/**
 * Сохраняет медиа-файлы вендора и удаляет ненужные
 */
export const saveVendorMedia = async ({
  newFiles,
  existingImages,
  allExistingMedia,
  currentLanguage,
  t
}: SaveVendorMediaParams): Promise<SaveVendorMediaResult> => {
  let loadingToast: string | number | undefined

  try {
    console.log('=== saveVendorMedia: Начало сохранения медиа ===')
    console.log('Входные параметры:')
    console.log(
      '- newFiles:',
      newFiles.map((f) => ({name: f.name, size: f.size, type: f.type}))
    )
    console.log('- existingImages:', existingImages)
    console.log('- allExistingMedia:', allExistingMedia)
    console.log('- currentLanguage:', currentLanguage)

    const token = getAccessToken()
    if (!token) {
      toast.error(t('authError'))
      return {success: false, error: 'No auth token'}
    }

    // Показываем loading toast только если есть что сохранять или удалять
    const hasChanges =
      newFiles.length > 0 || allExistingMedia.some((media) => media.url && !existingImages.includes(media.url))

    if (hasChanges) {
      loadingToast = toast.loading(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('loading')}</strong>
          <span>{t('savingMedia')}</span>
        </div>
      )
    }

    // 1. Определяем, какие изображения нужно удалить
    const imagesToDelete = allExistingMedia.filter((media) => {
      return media.url && !existingImages.includes(media.url)
    })

    console.log('=== Анализ удаления ===')
    console.log('- imagesToDelete:', imagesToDelete)

    // 2. Удаляем изображения, если есть что удалять
    if (imagesToDelete.length > 0) {
      const deleteIds = imagesToDelete.map((media) => media.id).filter((id) => id !== undefined) as number[]

      console.log('=== Удаление медиа ===')
      console.log('- deleteIds:', deleteIds)

      if (deleteIds.length > 0) {
        const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/me/vendor/media`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept-Language': currentLanguage
          },
          body: JSON.stringify(deleteIds)
        })

        console.log('- DELETE response status:', deleteResponse.status)

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete media: ${deleteResponse.statusText}`)
        }

        console.log('- Медиа успешно удалены')
      }
    }

    // 3. Если есть новые файлы, отправляем их
    if (newFiles.length > 0) {
      console.log('=== Загрузка новых файлов ===')

      const formData = new FormData()

      // Подготавливаем данные: оставшиеся ID медиа
      const remainingMediaIds = allExistingMedia
        .filter((media) => media.url && existingImages.includes(media.url))
        .map((media) => media.id)
        .filter((id) => id !== undefined) as number[]

      // --- Логика для newMediaPositions ---
      // Определяем занятые позиции (оставшиеся элементы)
      const occupiedPositions = allExistingMedia
        .map((media, index) => (media.url && existingImages.includes(media.url) ? index : null))
        .filter((v) => v !== null) as number[]

      // Определяем свободные позиции (где был элемент, но его удалили)
      const freePositions = allExistingMedia
        .map((media, index) => (media.url && !existingImages.includes(media.url) ? index : null))
        .filter((v) => v !== null) as number[]

      const newMediaPositions: number[] = []

      newFiles.forEach(() => {
        if (freePositions.length > 0) {
          // Берём первое свободное место
          newMediaPositions.push(freePositions.shift()!)
        } else {
          // Добавляем в конец
          const nextPos = occupiedPositions.length + newMediaPositions.length
          newMediaPositions.push(nextPos)
        }
      })

      console.log('- remainingMediaIds:', remainingMediaIds)
      console.log('- newMediaPositions:', newMediaPositions)

      // Добавляем каждую часть отдельно
      const oldMediaIdsBlob = new Blob([JSON.stringify(remainingMediaIds)], {type: 'application/json'})
      formData.append('oldMediaIds', oldMediaIdsBlob)

      const newMediaPositionsBlob = new Blob([JSON.stringify(newMediaPositions)], {type: 'application/json'})
      formData.append('newMediaPositions', newMediaPositionsBlob)

      // Добавляем новые файлы напрямую
      newFiles.forEach((file, index) => {
        console.log(`- Добавляем файл ${index + 1}:`, {name: file.name, size: file.size, type: file.type})
        formData.append('media', file, file.name)
      })

      // Логируем содержимое FormData
      console.log('=== Содержимое FormData ===')
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`- ${key}:`, {name: value.name, size: value.size, type: value.type})
        } else if (value instanceof Blob) {
          console.log(`- ${key}:`, 'Blob содержимое:', await value.text())
        } else {
          console.log(`- ${key}:`, value)
        }
      }

      // Отправляем запрос
      console.log('- Отправляем POST запрос...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/me/vendor/media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': currentLanguage
          // НЕ указываем Content-Type - браузер сам установит multipart/form-data с boundary
        },
        body: formData
      })

      console.log('- POST response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('- POST response error:', errorText)
        throw new Error(`Failed to save media: ${response.status} ${errorText}`)
      }

      console.log('- Новые файлы успешно загружены')
    }

    // Закрываем loading toast
    if (loadingToast) {
      toast.dismiss(loadingToast)
    }

    if (newFiles.length > 0 || imagesToDelete.length > 0) {
      console.log('=== Показываем success toast ===')
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('success')}</strong>
          <span>{t('mediaSavedSuccessfully')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
    }

    console.log('=== saveVendorMedia: Успешное завершение ===')
    return {success: true}
  } catch (error) {
    console.error('=== saveVendorMedia: ОШИБКА ===')
    console.error('Error saving vendor media:', error)

    // Закрываем loading toast в случае ошибки
    if (loadingToast) {
      toast.dismiss(loadingToast)
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    toast.error(
      <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
        <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('error')}</strong>
        <span>{t('failedToSaveMedia')}</span>
      </div>,
      {
        style: {
          background: '#D32F2F'
        }
      }
    )

    return {success: false, error: errorMessage}
  }
}

/**
 * Хук для сохранения медиа-файлов вендора
 */
export const useSaveVendorMedia = () => {
  const saveMedia = async (params: SaveVendorMediaParams) => {
    return await saveVendorMedia(params)
  }

  return {saveMedia}
}
