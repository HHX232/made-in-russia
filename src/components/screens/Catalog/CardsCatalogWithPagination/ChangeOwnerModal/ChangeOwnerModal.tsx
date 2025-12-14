'use client'
import {FC, useState, useEffect, useCallback} from 'react'
import styled from './ChangeOwnerModal.module.scss'
import {Product} from '@/services/products/product.types'
import useUsers from '@/components/pages/AdminPanel/AdminUsersPage/useUsers'
import instance from '@/api/api.interceptor'

interface ChangeOwnerModalProps {
  product: Product

  onClose: () => void
  onSuccess: () => void
}

const ChangeOwnerModal: FC<ChangeOwnerModalProps> = ({product, onClose, onSuccess}) => {
  const {users, loading, loadMoreUsers, hasNextPage, isFetchingNextPage} = useUsers(instance, 100)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isChanging, setIsChanging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Debug
  useEffect(() => {
    console.log('ChangeOwnerModal mounted')
    console.log('Product:', product)
    console.log('Instance:', instance)
    console.log('Users loaded:', users.length)
  }, [product, instance, users])

  // Фильтрация только вендоров
  const vendors = users.filter((user) => user.role.toLocaleLowerCase() === 'vendor')

  // Фильтрация по поисковому запросу
  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase()
    return (
      vendor.login.toLowerCase().includes(query) ||
      vendor.email.toLowerCase().includes(query) ||
      (vendor.phoneNumber && vendor.phoneNumber.includes(query))
    )
  })

  // Обработчик смены владельца
  const handleChangeOwner = useCallback(async () => {
    if (!selectedUserId) return

    setIsChanging(true)
    try {
      await instance.patch(`/products/${product.id}/owner/${selectedUserId}`)
      onSuccess()
    } catch (error) {
      console.error('Error changing owner:', error)
      alert('Ошибка при смене владельца')
    } finally {
      setIsChanging(false)
    }
  }, [selectedUserId, product.id, instance, onSuccess])

  // Обработчик скролла для подгрузки
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      const scrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100

      if (scrolledToBottom && hasNextPage && !isFetchingNextPage && !loading) {
        loadMoreUsers()
      }
    },
    [hasNextPage, isFetchingNextPage, loading, loadMoreUsers]
  )

  // Закрытие модального окна по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Блокировка скролла body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className={styled.modal_overlay} onClick={onClose}>
      <div className={styled.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styled.modal_header}>
          <h2 className={styled.modal_title}>Изменить владельца товара</h2>
          <button className={styled.modal_close} onClick={onClose}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <path
                d='M18 6L6 18M6 6L18 18'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>

        <div className={styled.modal_product_info}>
          <p className={styled.product_title}>{product.title}</p>
          {product.user && (
            <p className={styled.current_owner}>
              Текущий владелец: <strong>{product.user.login}</strong>
            </p>
          )}
        </div>

        <div className={styled.search_container}>
          <input
            type='text'
            className={styled.search_input}
            placeholder='Поиск по логину, email или телефону...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg width='20' height='20' viewBox='0 0 20 20' fill='none' className={styled.search_icon}>
            <path
              d='M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>

        <div className={styled.users_list} onScroll={handleScroll}>
          {loading && filteredVendors.length === 0 ? (
            <div className={styled.loading_state}>
              <div className={styled.spinner}></div>
              <p>Загрузка пользователей...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className={styled.empty_state}>
              <p>Вендоры не найдены</p>
            </div>
          ) : (
            <>
              {filteredVendors.map((vendor) => {
                const isCurrentOwner = product.user?.id === vendor.id
                const isSelected = selectedUserId === vendor.id

                return (
                  <div
                    key={vendor.id}
                    className={`${styled.user_item} ${isSelected ? styled.user_item_selected : ''} ${
                      isCurrentOwner ? styled.user_item_current : ''
                    }`}
                    onClick={() => !isCurrentOwner && setSelectedUserId(vendor.id)}
                  >
                    {vendor.avatarUrl ? (
                      <img src={vendor.avatarUrl} alt={vendor.login} className={styled.user_avatar} />
                    ) : (
                      <div className={styled.user_avatar_placeholder}>{vendor.login.charAt(0).toUpperCase()}</div>
                    )}
                    <div className={styled.user_info}>
                      <p className={styled.user_login}>
                        {vendor.login}
                        {isCurrentOwner && <span className={styled.current_badge}>Текущий</span>}
                      </p>
                      <p className={styled.user_email}>{vendor.email}</p>
                      {vendor.phoneNumber && <p className={styled.user_phone}>{vendor.phoneNumber}</p>}
                    </div>
                    {isSelected && !isCurrentOwner && (
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' className={styled.check_icon}>
                        <path
                          d='M20 6L9 17L4 12'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    )}
                  </div>
                )
              })}
              {isFetchingNextPage && (
                <div className={styled.loading_more}>
                  <div className={styled.spinner_small}></div>
                  <span>Загрузка...</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styled.modal_footer}>
          <button className={styled.button_cancel} onClick={onClose} disabled={isChanging}>
            Отмена
          </button>
          <button
            className={styled.button_confirm}
            onClick={handleChangeOwner}
            disabled={!selectedUserId || isChanging || selectedUserId === product.user?.id}
          >
            {isChanging ? (
              <>
                <div className={styled.spinner_small}></div>
                <span>Изменение...</span>
              </>
            ) : (
              'Изменить владельца'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChangeOwnerModal
