'use client'

import {useEffect, useState, useRef, useMemo, useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {useTranslations} from 'next-intl'
import {useSearchParams} from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import {ChatWindow} from '@/components/chat/ChatWindow/ChatWindow'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {setChats, addChats, setActiveChat, markMessageAsRead} from '@/store/slices/chatSlice'
import {chatService} from '@/services/chat/chat.service'
import {webSocketClient} from '@/lib/websocket-client'
import type {Chat} from '@/types/chat.types'
import styles from './ChatsPage.module.scss'

export const ChatsPage = () => {
  const t = useTranslations('chat')
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const {chats, activeChat} = useTypedSelector((state) => state.chat)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const activeChatIdRef = useRef<number | undefined>(undefined)
  const chatsListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeChatIdRef.current = activeChat?.id
  }, [activeChat])

  const backToAccountUrl = useMemo(() => {
    const from = searchParams.get('from')
    if (from === 'vendor') {
      return '/vendor'
    }
    return '/profile'
  }, [searchParams])

  const translateSystemMessage = (content: string) => {
    const chatStartedPattern = /^Chat started for product:\s*(.+)$/
    const match = content.match(chatStartedPattern)

    if (match) {
      const productName = match[1]
      return t('chatStartedForProduct', {productName})
    }

    return content
  }

  useEffect(() => {
    const chatIdParam = searchParams.get('chatId')
    if (!chatIdParam) {
      dispatch(setActiveChat(null))
    }

    loadChats()

    const subscribeToNotifications = () => {
      if (!webSocketClient.client || !webSocketClient.client.connected) {
        setTimeout(subscribeToNotifications, 500)
        return
      }

      console.log('Subscribing to personal notifications')

      webSocketClient.subscribeToNotifications((notification) => {
        console.log('Received notification:', notification)

        if (notification.type === 'MESSAGE_READ' && notification.messageId && notification.chatId) {
          dispatch(
            markMessageAsRead({
              messageId: notification.messageId,
              chatId: notification.chatId
            })
          )
          loadChats(activeChatIdRef.current)
        } else if (notification.type === 'NEW_MESSAGE') {
          loadChats(activeChatIdRef.current)
        }
      })
    }

    subscribeToNotifications()

    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadChats = async (preserveActiveChatId?: number) => {
    try {
      setIsLoading(true)
      setCurrentPage(0)
      const chatListResponse = await chatService.getUserChats(0, 20)
      dispatch(setChats(chatListResponse.chats))
      setHasMore(chatListResponse.hasMore ?? chatListResponse.chats.length === 20)

      const chatIdParam = searchParams.get('chatId')
      const targetChatId = chatIdParam ? parseInt(chatIdParam) : preserveActiveChatId

      if (targetChatId) {
        const targetChat = chatListResponse.chats.find((chat) => chat.id === targetChatId)
        if (targetChat) {
          dispatch(setActiveChat(targetChat))
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreChats = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)
      const nextPage = currentPage + 1
      const chatListResponse = await chatService.getUserChats(nextPage, 20)

      if (chatListResponse.chats.length > 0) {
        dispatch(addChats(chatListResponse.chats))
        setCurrentPage(nextPage)
        setHasMore(chatListResponse.hasMore ?? chatListResponse.chats.length === 20)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load more chats:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentPage, hasMore, isLoadingMore, dispatch])

  const handleChatsScroll = useCallback(() => {
    const container = chatsListRef.current
    if (!container || isLoadingMore || !hasMore) return

    const {scrollTop, scrollHeight, clientHeight} = container
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreChats()
    }
  }, [loadMoreChats, isLoadingMore, hasMore])

  useEffect(() => {
    const container = chatsListRef.current
    if (!container) return

    container.addEventListener('scroll', handleChatsScroll)
    return () => container.removeEventListener('scroll', handleChatsScroll)
  }, [handleChatsScroll])

  const handleChatSelect = (chat: Chat) => {
    dispatch(setActiveChat(chat))
  }

  const handleCloseChat = () => {
    dispatch(setActiveChat(null))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    } else if (days === 1) {
      return t('yesterday')
    } else if (days < 7) {
      return `${days} ${t('daysAgo')}`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <>
      <Header />
      <div className={`container ${styles.chats__container}`}>
        <div className={styles.header__row}>
          <h1 className={styles.title}>{t('myChats')}</h1>
          <Link href={backToAccountUrl} className={styles.back__to__account}>
            ← {t('backToAccount')}
          </Link>
        </div>

        <div className={styles.chats__layout}>
          <div className={styles.chats__list} ref={chatsListRef}>
            {isLoading ? (
              <div className={styles.loading}>{t('loading')}</div>
            ) : chats.length === 0 ? (
              <div className={styles.empty}>
                <p>{t('noChats')}</p>
                <p className={styles.empty__hint}>{t('noChatsHint')}</p>
              </div>
            ) : (
              <>
                {chats.map((chat) => {
                  const isVendorChat = chat.isVendorChat && chat.vendorInfo
                  const displayImage = isVendorChat ? chat.vendorInfo?.avatarUrl : chat.product.imageUrl
                  const capitalizeFirstLetter = (str: string | undefined) => {
                    if (!str) return str
                    return str.charAt(0).toUpperCase() + str.slice(1)
                  }
                  const displayName = isVendorChat ? capitalizeFirstLetter(chat.vendorInfo?.name) : chat.product.name

                  const getInitial = (name: string | undefined) => {
                    if (!name) return '?'
                    const cleanName = name.includes('"') ? name.split('"')[1] || name : name
                    return cleanName.charAt(0).toUpperCase()
                  }

                  return (
                    <div
                      key={chat.id}
                      className={`${styles.chat__item} ${activeChat?.id === chat.id ? styles.active : ''} ${
                        chat.unreadCount > 0 ? styles.unread : ''
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className={styles.chat__avatar}>
                        {displayImage ? (
                          <img src={displayImage} alt={displayName || ''} />
                        ) : (
                          <div className={`${styles.placeholder} ${isVendorChat ? styles.vendor__placeholder : ''}`}>
                            {getInitial(displayName)}
                          </div>
                        )}
                      </div>

                      <div className={styles.chat__info}>
                        <div className={styles.chat__header}>
                          <h3 className={styles.chat__title}>
                            {displayName}{' '}
                            {isVendorChat && <span className={styles.vendor__badge}>{t('vendorChat')}</span>}
                          </h3>
                          <span className={styles.chat__time}>
                            {formatDate(chat.lastMessage?.createdAt || chat.createdAt)}
                          </span>
                        </div>

                        <div className={styles.chat__preview}>
                          <p className={styles.last__message}>
                            {chat.lastMessage ? (
                              chat.lastMessage.isSystem ? (
                                <span className={styles.system__message}>
                                  {translateSystemMessage(chat.lastMessage.content)}
                                </span>
                              ) : (
                                <>
                                  <span className={styles.sender__name}>{chat.lastMessage.senderName}:</span>{' '}
                                  {chat.lastMessage.content}
                                </>
                              )
                            ) : (
                              <span className={styles.no__messages}>{t('noMessages')}</span>
                            )}
                          </p>
                          {chat.unreadCount > 0 && <span className={styles.unread__badge}>{chat.unreadCount}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isLoadingMore && <div className={styles.loading__more}>{t('loading')}</div>}
              </>
            )}
          </div>

          <div className={`${styles.chat__window__container} ${activeChat ? styles.chat__window__mobile__open : ''}`}>
            {activeChat ? (
              <div className={styles.chat__window__wrapper}>
                <div className={styles.mobile__nav__bar}>
                  <button className={styles.close__chat} onClick={handleCloseChat}>
                    ← {t('backToList')}
                  </button>
                  <Link href={backToAccountUrl} className={styles.back__to__account__mobile}>
                    {t('backToAccount')} →
                  </Link>
                </div>
                <ChatWindow />
              </div>
            ) : (
              <div className={styles.select__chat}>
                <p>{t('selectChat')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
