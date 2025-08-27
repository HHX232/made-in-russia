import {memo, useState, useCallback, useEffect} from 'react'
import styles from './VendorAdditionalContacts.module.scss'
import {useTranslations} from 'next-intl'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import Image from 'next/image'
import {useUpdateVendorDetails} from '@/api/useVendorApi'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {shallowEqual} from 'react-redux'
import {toast} from 'sonner'

const arrowDark = '/arrow-dark.svg'

export const VendorAdditionalContacts = memo(
  ({
    isOnlyShow = false,
    onlyShowEmails,
    onlyShowPhones,
    onlyShowWebsites
  }: {
    isOnlyShow?: boolean
    onlyShowEmails?: string[]
    onlyShowPhones?: string[]
    onlyShowWebsites?: string[]
  }) => {
    const [expanded, setExpanded] = useState(false)
    const t = useTranslations('VendorPage')
    const {mutate: updateVendorDetails} = useUpdateVendorDetails()
    const {updateVendorDetails: updateVendorDetailsAction} = useActions()

    const vendorDetails = useTypedSelector((s) => s.user.user?.vendorDetails, shallowEqual)
    const user = useTypedSelector((s) => s.user.user, shallowEqual)

    const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['', '', ''])
    const [emails, setEmails] = useState<string[]>(['', '', ''])
    const [sites, setSites] = useState<string[]>(['', '', ''])

    // Функция для обеспечения массива из 3 элементов
    const ensureThreeElements = (arr?: string[]): string[] => {
      const result = arr ? [...arr] : []
      while (result.length < 3) {
        result.push('')
      }
      return result.slice(0, 3) // Берем только первые 3 элемента
    }

    useEffect(() => {
      if (isOnlyShow) {
        // Если режим только просмотра, используем переданные пропсы
        setPhoneNumbers(ensureThreeElements(onlyShowPhones))
        setEmails(ensureThreeElements(onlyShowEmails))
        setSites(ensureThreeElements(onlyShowWebsites))
      } else if (vendorDetails) {
        // Если обычный режим, используем данные из Redux
        setPhoneNumbers(ensureThreeElements(vendorDetails.phoneNumbers))
        setEmails(ensureThreeElements(vendorDetails.emails))
        setSites(ensureThreeElements(vendorDetails.sites))
      }
    }, [vendorDetails, isOnlyShow, onlyShowPhones, onlyShowEmails, onlyShowWebsites])

    const handlePhoneChange = useCallback(
      (index: number, value: string) => {
        if (isOnlyShow) return // Не позволяем изменения в режиме просмотра

        setPhoneNumbers((prev) => {
          const newPhoneNumbers = [...prev]
          newPhoneNumbers[index] = value
          return newPhoneNumbers
        })
      },
      [isOnlyShow]
    )

    const handleEmailChange = useCallback(
      (index: number, value: string) => {
        if (isOnlyShow) return // Не позволяем изменения в режиме просмотра

        setEmails((prev) => {
          const newEmails = [...prev]
          newEmails[index] = value
          return newEmails
        })
      },
      [isOnlyShow]
    )

    const handleSiteChange = useCallback(
      (index: number, value: string) => {
        if (isOnlyShow) return // Не позволяем изменения в режиме просмотра

        setSites((prev) => {
          const newSites = [...prev]
          newSites[index] = value
          return newSites
        })
      },
      [isOnlyShow]
    )

    const validateInputs = () => {
      for (const phone of phoneNumbers) {
        if (phone.trim() !== '' && phone.trim().length < 7) {
          toast.error(t('invalidPhone') || 'Phone number must be at least 7 characters long')
          return false
        }
      }

      for (const email of emails) {
        if (email.trim() !== '' && (!email.includes('@') || !email.includes('.'))) {
          toast.error(t('invalidEmail') || 'Email must contain @ and .')
          return false
        }
      }

      return true
    }

    const handleSave = useCallback(() => {
      if (isOnlyShow) return // Не позволяем сохранение в режиме просмотра

      if (!validateInputs()) return

      const filteredPhoneNumbers = phoneNumbers.filter((phone) => phone.trim() !== '')
      const filteredEmails = emails.filter((email) => email.trim() !== '')
      const filteredSites = sites.filter((site) => site.trim() !== '')

      updateVendorDetailsAction({
        ...vendorDetails,
        phoneNumbers: filteredPhoneNumbers,
        emails: filteredEmails,
        sites: filteredSites
      })

      updateVendorDetails({
        categories:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vendorDetails?.productCategories?.map((cat) => cat.name) || (vendorDetails as any)?.categories || [],
        countries: vendorDetails?.countries?.map((country) => country) || [],
        description: vendorDetails?.description,
        inn: vendorDetails?.inn,
        phoneNumber: user?.phoneNumber,
        region: user?.region,
        phoneNumbers: filteredPhoneNumbers,
        emails: filteredEmails,
        sites: filteredSites
      })
    }, [phoneNumbers, emails, sites, vendorDetails, user, updateVendorDetails, updateVendorDetailsAction, isOnlyShow])

    const handleOnBlur = useCallback(
      (type: 'phones' | 'emails' | 'sites') => {
        if (isOnlyShow) return // Не выполняем onBlur в режиме просмотра

        switch (type) {
          case 'phones':
            updateVendorDetailsAction({...vendorDetails, phoneNumbers: phoneNumbers})
            break
          case 'emails':
            updateVendorDetailsAction({...vendorDetails, emails: emails})
            break
          case 'sites':
            updateVendorDetailsAction({...vendorDetails, sites: sites})
            break
        }
      },
      [vendorDetails, phoneNumbers, emails, sites, updateVendorDetailsAction, isOnlyShow]
    )

    return (
      <div className={`${styles.vendor__additional__contacts} ${expanded ? styles.expanded : ''}`}>
        <h3 className={styles.vendor__additional__contacts__title}>{t('additionalContacts')}</h3>

        <div className={styles.additional__inner}>
          <div className={styles.additional__phones}>
            <h4 className={styles.additional__phones__title}>{t('phones')}</h4>
            {[0, 1, 2].map((index) => (
              <TextInputUI
                readOnly={isOnlyShow}
                onBlur={() => handleOnBlur('phones')}
                key={`phone-${index}`}
                placeholder={t('phoneInputTitle')}
                currentValue={phoneNumbers[index]}
                onSetValue={(value) => handlePhoneChange(index, value)}
                theme='superWhite'
              />
            ))}
          </div>

          <div className={styles.additional__emails}>
            <h4 className={styles.additional__phones__title}>{t('emails')}</h4>
            {[0, 1, 2].map((index) => (
              <TextInputUI
                readOnly={isOnlyShow}
                key={`email-${index}`}
                onBlur={() => handleOnBlur('emails')}
                placeholder={t('emailInputTitle')}
                currentValue={emails[index]}
                onSetValue={(value) => handleEmailChange(index, value)}
                theme='superWhite'
              />
            ))}
          </div>

          <div className={styles.additional__sites}>
            <h4 className={styles.additional__phones__title}>{t('sites')}</h4>
            {[0, 1, 2].map((index) => (
              <TextInputUI
                readOnly={isOnlyShow}
                onBlur={() => handleOnBlur('sites')}
                key={`site-${index}`}
                placeholder={t('siteInputTitle')}
                currentValue={sites[index]}
                onSetValue={(value) => handleSiteChange(index, value)}
                theme='superWhite'
              />
            ))}
          </div>

          {!isOnlyShow && (
            <div className={styles.additional__buttons}>
              <button onClick={handleSave} className={styles.save__additional}>
                {t('save')}
              </button>
            </div>
          )}
        </div>

        {!expanded && (
          <div className={styles.expand__overlay} onClick={() => setExpanded(true)}>
            <Image className={styles.arrow} alt='' src={arrowDark} width={20} height={20} />
          </div>
        )}
      </div>
    )
  }
)

VendorAdditionalContacts.displayName = 'VendorAdditionalContacts'
