import {FC, useEffect, useState} from 'react'
import styles from './ProfilePageBottom.module.scss'
// import {Link} from '@/i18n/navigation'
import Image from 'next/image'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import Accordion from '@/components/UI-kit/Texts/Accordions/Accordions'
import {useTranslations} from 'next-intl'
import ServiceDefaultFAQ from '@/services/faq/ServiceDefaultFAQ.service'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

interface IHelpListButtonProps {
  linkTo: string
  iconSrc: string
  text: string
  onClick?: () => void
  extraClass?: string
}
// const aaaa = [
//   {
//     title: 'Как зарегистрировать аккаунт?',
//     value:
//       'Нажмите "Регистрация" в правом верхнем углу сайта, заполните форму (имя, email, телефон, пароль) и подтвердите email. После этого аккаунт будет создан.'
//   },
//   {
//     title: 'Как восстановить пароль?',
//     value:
//       'На странице входа нажмите "Забыли пароль?", введите email, указанный при регистрации. Вам придет ссылка для сброса пароля. Следуйте инструкциям в письме.'
//   },
//   {
//     title: 'Как изменить личные данные в профиле?',
//     value:
//       'Зайдите в "Личный кабинет" → "Мои данные". Здесь можно изменить ФИО, контакты и другие данные. Не забудьте сохранить изменения.'
//   },
//   {
//     title: 'Где посмотреть историю заказов?',
//     value: 'В личном кабинете в разделе "Мои заказы" хранится полная история с датами, статусами и составом заказов.'
//   },
//   {
//     title: 'Как добавить или удалить адрес доставки?',
//     value:
//       'В личном кабинете откройте "Адреса доставки". Для добавления нажмите "+ Новый адрес", для удаления — значок корзины рядом с адресом.'
//   },
//   {
//     title: 'Почему я не могу войти в аккаунт?',
//     value:
//       'Проверьте правильность email и пароля. Если проблема сохраняется, воспользуйтесь восстановлением пароля или обратитесь в поддержку.'
//   },
//   {
//     title: 'Как подписаться на рассылку акций?',
//     value:
//       'В личном кабинете в "Настройках уведомлений" активируйте опцию "Email-рассылка". Также можно подписаться при оформлении заказа.'
//   },
//   {
//     title: 'Как отменить или изменить заказ?',
//     value:
//       'Если заказ еще не собран, откройте его в "Моих заказах" и нажмите "Отменить". Для изменений свяжитесь с поддержкой по телефону или через чат.'
//   },
//   {
//     title: 'Где ввести промокод или скидочный купон?',
//     value:
//       'В корзине перед оформлением заказа есть поле "Промокод". Введите код и нажмите "Применить". Скидка отразится в итоговой сумме.'
//   },
//   {
//     title: 'Как связать аккаунт с соцсетями?',
//     value:
//       'В "Настройках профиля" выберите "Привязать соцсети" и авторизуйтесь через Facebook, Google или другой доступный сервис.'
//   },
//   {
//     title: 'Как проверить статус заказа?',
//     value:
//       'В личном кабинете в разделе "Мои заказы" найдите нужный заказ. Его текущий статус (например, "В обработке", "Отправлен") будет указан рядом.'
//   },
//   {
//     title: 'Как удалить аккаунт?',
//     value:
//       'Напишите в поддержку с запросом на удаление. Учтите: это приведет к потере истории заказов и бонусных баллов.'
//   },
//   {
//     title: 'Почему не приходит письмо с подтверждением?',
//     value:
//       'Проверьте папку "Спам". Если письма нет, запросите повторную отправку на странице регистрации или входа. Также убедитесь, что email введен верно.'
//   },
//   {
//     title: 'Как изменить email или телефон в профиле?',
//     value:
//       'В "Личном кабинете" → "Мои данные" нажмите "Изменить" рядом с email/телефоном. Для email потребуется подтверждение через новую почту.'
//   },
//   {
//     title: 'Как оформить заказ без регистрации?',
//     value:
//       'При оформлении выберите "Продолжить без регистрации". Однако для отслеживания заказа и скидок рекомендуем создать аккаунт.'
//   }
// ]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HelpListButton: FC<IHelpListButtonProps> = ({linkTo, extraClass, iconSrc, text, onClick}) => {
  return (
    // <Link href={linkTo}> </Link>
    <li style={{cursor: 'pointer'}} onClick={onClick} className={`${styles.help__content__item} ${extraClass}`}>
      <Image src={iconSrc} alt={text} width={27} height={27} />
      <p>{text}</p>
    </li>
  )
}

const ProfilePageBottomHelp: FC = () => {
  const [isQuestOpen, setIsQuestOpen] = useState(false)
  const t = useTranslations('ProfilePage.ProfilePageBottomHelp')
  const [faqData, setFaqData] = useState<{question: string; answer: string}[]>([])
  const currentLangFromHook = useCurrentLanguage()

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const data = await ServiceDefaultFAQ.getFAQ(currentLangFromHook)
        setFaqData(data)
      } catch (error) {
        console.error('Error fetching FAQ data:', error)
      }
    }
    fetchFaqData()
  }, [])

  const helpListButtonData = [
    {
      linkTo: '#',
      iconSrc: '/profile/help_chat_svg.svg',
      text: t('support')
    },
    {
      linkTo: '#',
      iconSrc: '/profile/quest.svg',
      text: t('quest')
    }
  ]
  return (
    <div className={`${styles.help__box}`}>
      <ModalWindowDefault extraClass={styles.faq__modal} isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)}>
        <h3 style={{fontSize: '30px', fontWeight: '500', textAlign: 'center', margin: '10px 60px 40px 60px'}}>
          {t('title')}
        </h3>
        <Accordion
          items={
            faqData.length > 0
              ? faqData.map((el) => {
                  return {
                    title: el.question,
                    value: el.answer,
                    id: el.question.toString()
                  }
                })
              : [{title: t('questNotFoundTitle'), value: t('questNotFoundValue'), id: 'questNotFound'}]
          }
        />
      </ModalWindowDefault>
      <h3 className={`${styles.help__box__title}`}>{t('service')}</h3>
      <ul className={`${styles.help__content}`}>
        {helpListButtonData.map((el, i) => {
          return (
            <HelpListButton
              key={i}
              text={el.text}
              iconSrc={el.iconSrc}
              linkTo={el.linkTo}
              onClick={() => {
                if (i === 1) {
                  setIsQuestOpen(true)
                }
              }}
            />
          )
        })}
      </ul>
    </div>
  )
}

export default ProfilePageBottomHelp
