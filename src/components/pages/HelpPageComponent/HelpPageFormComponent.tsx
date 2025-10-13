import {FC, useState} from 'react'
import styles from './HelpPageFormComponent.module.scss'
import {useTranslations} from 'next-intl'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {toast} from 'sonner'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'

const HelpPageFormComponent: FC = () => {
  const t = useTranslations('HelpPage')
  const user = useTypedSelector((state) => state.user.user)

  const [activeImages, setActiveImages] = useState<string[]>()
  const [images, setImages] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formElement: HTMLFormElement = e.target as HTMLFormElement
      const fd = new FormData(formElement)

      // JSON-данные
      const data = {
        username: fd.get('firstName'),
        email: fd.get('email'),
        subject: 'Сообщение в поддержку',
        body: fd.get('message')
      }

      const submitData = new FormData()
      submitData.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}))

      // Картинки
      images.forEach((image) => {
        // Если image это File — просто добавляем
        if (image instanceof File) {
          submitData.append('media', image, image.name)
        }
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SECOND}/api/v1/support`, {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        clearForm(formElement)
        handleSuccess()
      } else {
        handleError()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      handleError()
    }
  }

  const clearForm = (elem: HTMLFormElement) => {
    elem.reset()
    setImages([])
    setActiveImages([])
  }

  const handleSuccess = () => {
    toast.success(
      <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
        <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('successMessage')}</strong>
      </div>,
      {
        style: {
          background: '#2E7D32'
        }
      }
    )
  }

  const handleError = () => {
    toast.error(
      <div style={{lineHeight: 1.5}}>
        <strong style={{display: 'block', marginBottom: 4}}>{t('errorMessage')}</strong>
      </div>,
      {
        style: {
          background: '#AC2525'
        }
      }
    )
  }

  return (
    <div className={styles.contacts_form}>
      <form onSubmit={handleSubmit}>
        <h2 className={styles.contacts_form__md_media}>Контакты</h2>
        <h3 className={styles.contacts_form__title}>Заполните форму</h3>
        <div className={styles.contacts_form__description}>
          При обращении подробно опишите свой вопрос или проблему, с указанием ссылок, скриношотов или фото. Мы открыты
          для любых вопросов! Работаем круглосуточно без выходных и праздников.
        </div>
        <div className={styles.contacts_form__grid}>
          <div className={`${styles.contacts_form__col} ${styles.contacts_form__col_half}`}>
            <input
              type='text'
              name='firstName'
              className={styles.contacts_form__input}
              placeholder='Ваше имя'
              autoComplete='firstName'
              value={user?.login}
              required
            />
          </div>
          <div className={`${styles.contacts_form__col} ${styles.contacts_form__col_half}`}>
            <input
              type='tel'
              name='phone'
              className={styles.contacts_form__input}
              placeholder='Номер телефона'
              autoComplete='tel'
              value={user?.phoneNumber}
              required
            />
          </div>
          <div className={styles.contacts_form__col}>
            <input
              type='email'
              name='email'
              className={styles.contacts_form__input}
              placeholder='E-mail'
              autoComplete='email'
              value={user?.email}
              required
            />
          </div>
          <div className={styles.contacts_form__col}>
            <textarea
              name='message'
              className={styles.contacts_form__textarea}
              placeholder='Напишите Ваше обращение'
              rows={5}
              required
            ></textarea>
          </div>
          <div className={styles.contacts_form__col}>
            <div className={styles.contacts_form__file_wrapper}>
              <span>Добавить медиафайлы</span>
            </div>
            <CreateImagesInput
              extraClass={styles.imagesInput}
              maxFiles={8}
              allowMultipleFiles
              showBigFirstItem={false}
              inputIdPrefix='contact'
              onActiveImagesChange={setActiveImages}
              activeImages={activeImages}
              onFilesChange={setImages}
            />
          </div>
          <div className={styles.contacts_form__col}>
            <button type='submit' className={styles.btn_accent}>
              Отправить
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default HelpPageFormComponent
