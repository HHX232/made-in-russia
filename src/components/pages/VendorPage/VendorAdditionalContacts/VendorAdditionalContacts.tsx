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

export const VendorAdditionalContacts = memo(({isOnlyShow = false}: {isOnlyShow?: boolean}) => {
  const [expanded, setExpanded] = useState(false)
  const t = useTranslations('VendorPage')
  const {mutate: updateVendorDetails} = useUpdateVendorDetails()
  const {updateVendorDetails: updateVendorDetailsAction} = useActions()

  const vendorDetails = useTypedSelector((s) => s.user.user?.vendorDetails, shallowEqual)
  const user = useTypedSelector((s) => s.user.user, shallowEqual)

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['', '', ''])
  const [emails, setEmails] = useState<string[]>(['', '', ''])
  const [sites, setSites] = useState<string[]>(['', '', ''])

  useEffect(() => {
    if (vendorDetails) {
      setPhoneNumbers([
        vendorDetails.phoneNumbers?.[0] || '',
        vendorDetails.phoneNumbers?.[1] || '',
        vendorDetails.phoneNumbers?.[2] || ''
      ])
      setEmails([vendorDetails.emails?.[0] || '', vendorDetails.emails?.[1] || '', vendorDetails.emails?.[2] || ''])
      setSites([vendorDetails.sites?.[0] || '', vendorDetails.sites?.[1] || '', vendorDetails.sites?.[2] || ''])
    }
  }, [vendorDetails])

  const handlePhoneChange = useCallback((index: number, value: string) => {
    setPhoneNumbers((prev) => {
      const newPhoneNumbers = [...prev]
      newPhoneNumbers[index] = value
      return newPhoneNumbers
    })
  }, [])

  const handleEmailChange = useCallback((index: number, value: string) => {
    setEmails((prev) => {
      const newEmails = [...prev]
      newEmails[index] = value
      return newEmails
    })
  }, [])

  const handleSiteChange = useCallback((index: number, value: string) => {
    setSites((prev) => {
      const newSites = [...prev]
      newSites[index] = value
      return newSites
    })
  }, [])

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: vendorDetails?.productCategories?.map((cat) => cat.name) || (vendorDetails as any)?.categories || [],
      countries: vendorDetails?.countries?.map((country) => country) || [],
      description: vendorDetails?.description,
      inn: vendorDetails?.inn,
      phoneNumber: user?.phoneNumber,
      region: user?.region,
      phoneNumbers: filteredPhoneNumbers,
      emails: filteredEmails,
      sites: filteredSites
    })
  }, [phoneNumbers, emails, sites, vendorDetails, user, updateVendorDetails, updateVendorDetailsAction])

  return (
    <div className={`${styles.vendor__additional__contacts} ${expanded ? styles.expanded : ''}`}>
      {/* <p>{vendorDetails?.phoneNumbers?.map((value) => value).join(', ')}</p>
      <p>{vendorDetails?.emails?.map((value) => value).join(', ')}</p>
      <p>{vendorDetails?.sites?.map((value) => value).join(', ')}</p>
      <p>CATEGORIES {vendorDetails?.productCategories?.map((value) => value.name).join(', ')}</p>
      <p>COUNTRIES {vendorDetails?.countries?.map((value) => value.name).join(', ')}</p> */}
      <h3 className={styles.vendor__additional__contacts__title}>{t('additionalContacts')}</h3>

      <div className={styles.additional__inner}>
        <div className={styles.additional__phones}>
          <h4 className={styles.additional__phones__title}>{t('phones')}</h4>
          {[0, 1, 2].map((index) => (
            <TextInputUI
              readOnly={isOnlyShow}
              onBlur={() => updateVendorDetailsAction({...vendorDetails, phoneNumbers: phoneNumbers})}
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
              onBlur={() => updateVendorDetailsAction({...vendorDetails, emails: emails})}
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
              onBlur={() => updateVendorDetailsAction({...vendorDetails, sites: sites})}
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
})

VendorAdditionalContacts.displayName = 'VendorAdditionalContacts'
