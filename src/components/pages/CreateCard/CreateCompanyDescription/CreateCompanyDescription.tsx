import {FC} from 'react'
import styles from './CreateCompanyDescription.module.scss'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import Image from 'next/image'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import {useImageModal} from '@/hooks/useImageModal'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {HELP_IMAGES} from '../CreateCard'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import useWindowWidth from '@/hooks/useWindoWidth'
import {useTranslations} from 'next-intl'

const vopros = '/vopros.svg'

// Тип для элемента с изображением и описанием
// Теперь поддерживает как File, так и string (URL)
interface ImageItem {
  image: File | string | null
  description: string
}

// Тип для всех данных компании
interface CompanyDescriptionData {
  topDescription: string
  images: ImageItem[]
  bottomDescription: string
}

interface CreateCompanyDescriptionProps {
  // Текущие значения
  data?: CompanyDescriptionData
  // Колбэк для обновления данных
  onChange?: (data: CompanyDescriptionData) => void
}

const CreateCompanyDescription: FC<CreateCompanyDescriptionProps> = ({
  data = {
    topDescription: '',
    images: [
      {image: null, description: ''},
      {image: null, description: ''},
      {image: null, description: ''},
      {image: null, description: ''}
    ],
    bottomDescription: ''
  },
  onChange
}) => {
  // Обработчик изменения верхнего описания
  const handleTopDescriptionChange = (value: string) => {
    if (onChange) {
      onChange({
        ...data,
        topDescription: value
      })
    }
  }
  const t = useTranslations('CreateCompanyDescription')

  const {modalImage, isModalOpen, openModal, closeModal} = useImageModal()
  // Обработчик изменения нижнего описания
  const handleBottomDescriptionChange = (value: string) => {
    if (onChange) {
      onChange({
        ...data,
        bottomDescription: value
      })
    }
  }

  // Обработчик изменения изображения
  const handleImageChange = (index: number, files: File[]) => {
    if (onChange) {
      const newImages = [...data.images]

      // Если индекс выходит за пределы массива, добавляем пустые элементы
      while (newImages.length <= index) {
        newImages.push({image: null, description: ''})
      }

      newImages[index] = {
        ...newImages[index],
        image: files[0] || null
      }

      onChange({
        ...data,
        images: newImages
      })
    }
  }

  // Обработчик изменения описания изображения
  const handleImageDescriptionChange = (index: number, value: string) => {
    if (onChange) {
      const newImages = [...data.images]

      // Если индекс выходит за пределы массива, добавляем пустые элементы
      while (newImages.length <= index) {
        newImages.push({image: null, description: ''})
      }

      newImages[index] = {
        ...newImages[index],
        description: value
      }

      onChange({
        ...data,
        images: newImages
      })
    }
  }

  // Обработчик удаления начальных изображений (URL)
  const handleActiveImagesChange = (index: number, remainingUrls: string[]) => {
    if (onChange) {
      const newImages = [...data.images]

      // Проверяем, существует ли элемент по данному индексу
      if (index < newImages.length && typeof newImages[index].image === 'string') {
        // Если массив remainingUrls пустой, значит изображение было удалено
        newImages[index] = {
          ...newImages[index],
          image: remainingUrls.length > 0 ? remainingUrls[0] : null
        }
        onChange({
          ...data,
          images: newImages
        })
      }
    }
  }

  // Функция для получения activeImages для CreateImagesInput
  const getActiveImages = (item: ImageItem | undefined): string[] => {
    if (item && typeof item.image === 'string' && item.image) {
      return [item.image]
    }
    return []
  }

  // Создаем массив всех элементов (существующих + пустых до 4)
  const allItems = [...data.images]
  while (allItems.length < 4) {
    allItems.push({image: null, description: ''})
  }

  const indowWidth = useWindowWidth()

  return (
    <div className={`${styles.create}`}>
      <ModalWindowDefault isOpen={isModalOpen} onClose={closeModal}>
        {modalImage && (
          <Image
            className={`${styles.drop__extra__image} ${styles.drop__extra__image__modal}`}
            src={modalImage}
            alt='Help image'
            width={1000}
            height={1000}
          />
        )}
      </ModalWindowDefault>
      <div className={`${styles.descr__el__title} ${styles.descr__el__title__right}`}>
        <p className={`${styles.descr__title}`}>{t('infoAboutCompanyPlaceholder')}</p>
        <DropList
          direction={indowWidth && indowWidth < 768 ? 'bottom' : 'right'}
          safeAreaEnabled
          extraClass={`${styles.drop__extra}`}
          positionIsAbsolute={false}
          trigger='hover'
          arrowClassName={`${styles.arrow__none}`}
          title={<Image src={vopros} alt='vopros' width={27} height={27} />}
          items={[
            <Image
              onClick={() => {
                openModal(HELP_IMAGES.companyDescription)
              }}
              src={HELP_IMAGES.companyDescription}
              alt='vopros'
              width={300}
              height={500}
              key={1}
            />
          ]}
        />
      </div>
      <div className={`${styles.create__inner}`}>
        <div className={`${styles.inner__title}`}>{t('infoAboutCompany')}</div>
        <TextAreaUI
          extraClass={`${styles.inner__title__input__extra__big}`}
          currentValue={data.topDescription}
          placeholder={t('infoAboutCompanyPlaceholder')}
          onSetValue={handleTopDescriptionChange}
          theme='superWhite'
        />
        <ul className={`${styles.company__images__box}`}>
          {allItems.map((item, index) => (
            <li key={index} className={`${styles.company__images__element}`}>
              <CreateImagesInput
                extraClass={`${styles.company__images__element__images__extra}`}
                onFilesChange={(files) => handleImageChange(index, files)}
                onActiveImagesChange={(remainingUrls) => handleActiveImagesChange(index, remainingUrls)}
                maxFiles={1}
                activeImages={getActiveImages(item)}
                inputIdPrefix={`company-image-${index}`}
              />
              <TextInputUI
                extraClass={`${styles.company__images__element__title__extra}`}
                currentValue={item.description}
                placeholder={t('descriptionPlaceholder')}
                onSetValue={(value) => handleImageDescriptionChange(index, value)}
                theme='superWhite'
              />
            </li>
          ))}
        </ul>
        <TextAreaUI
          extraClass={`${styles.inner__title__input__extra__big}`}
          currentValue={data.bottomDescription}
          placeholder={t('infoAboutCompanyPlaceholder')}
          onSetValue={handleBottomDescriptionChange}
          theme='superWhite'
        />
      </div>
    </div>
  )
}

export default CreateCompanyDescription
