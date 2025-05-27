// CommentSection/CommentSection.tsx
'use client'
import {useEffect, useState} from 'react'
import CardBottomPage from '../CardBottomPage/CardBottomPage'

const avatar1 = '/avatars/avatar-v-1.svg'
const avatar2 = '/avatars/avatar-v-2.svg'
const comm1 = '/comments/comm1.jpg'
const comm2 = '/comments/comm2.jpg'

interface Comment {
  commentID: string
  userId: string
  userName: string
  userImage: string
  commentText: string
  createdAt: string
  starsCount: number
  images: string[]
}

interface CommentsSectionProps {
  cardId: string
}

export default function CommentsSection({cardId}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true)

        await new Promise((resolve) => setTimeout(resolve, 8000))

        const mockComments: Comment[] = [
          {
            commentID: '1',
            userId: 'user101',
            userName: 'Алексей Иванов',
            userImage: avatar2,
            commentText:
              'Отличный пост, очень информативно! Отличный пост, очень информативно! Отличный пост, очень информативно! Отличный пост, очень информативно!',
            createdAt: '2023-05-15T10:30:00Z',
            starsCount: 2,
            images: [comm1]
          },
          {
            commentID: '2',
            userId: 'user202',
            userName: 'Мария Петрова',
            userImage: avatar1,
            commentText: 'Спасибо за полезную информацию!',
            createdAt: '2023-05-16T14:45:00Z',
            starsCount: 4,
            images: [comm2, comm1]
          },
          {
            commentID: '3',
            userId: 'user303',
            userName: 'Дмитрий Смирнов',
            userImage: avatar1,
            commentText: 'Есть вопросы по второму пункту, можно уточнить?',
            createdAt: '2023-05-17T09:15:00Z',
            starsCount: 5,
            images: []
          },
          {
            commentID: '4',
            userId: 'user404',
            userName: 'Елена Кузнецова',
            userImage: avatar2,
            commentText: 'Все понятно и доступно объяснено, благодарю!',
            createdAt: '2023-05-18T16:20:00Z',
            starsCount: 5,
            images: [comm2, comm1]
          },
          {
            commentID: '5',
            userId: 'user505',
            userName: 'Сергей Васильев',
            userImage: avatar2,
            commentText: 'Хотелось бы увидеть больше примеров кода.',
            createdAt: '2023-05-19T11:10:00Z',
            starsCount: 3,
            images: [comm1]
          }
        ]

        setComments(mockComments)
      } catch (error) {
        console.error('Error loading comments:', error)
        setComments([])
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
  }, [cardId])

  return <CardBottomPage isLoading={isLoading} comments={comments} />
}
