import {useState, useCallback} from 'react'

export const useImageModal = () => {
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = useCallback((imageSrc: string) => {
    setModalImage(imageSrc)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    // Небольшая задержка перед очисткой изображения для плавной анимации закрытия
    setTimeout(() => setModalImage(null), 300)
  }, [])

  return {
    modalImage,
    isModalOpen,
    openModal,
    closeModal
  }
}
