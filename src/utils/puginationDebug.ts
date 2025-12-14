/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/paginationDebug.ts

interface PaginationDebugInfo {
  currentPage: number
  totalPages: number
  loadedPages: number[]
  totalComments: number
  uniqueCommentIds: number[]
  duplicateCount: number
}

export const createPaginationDebugger = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const debugInfo: PaginationDebugInfo = {
    currentPage: 0,
    totalPages: 0,
    loadedPages: [],
    totalComments: 0,
    uniqueCommentIds: [],
    duplicateCount: 0
  }

  const logPageLoad = (page: number, response: any) => {
    console.group(`📄 Загрузка страницы ${page}`)
    // console.log('Ответ API:', response)
    // console.log('Количество элементов:', response.content?.length || 0)
    // console.log('Номер страницы:', response.page?.number || response.number || page)
    // console.log('Всего страниц:', response.page?.totalPages || response.totalPages || 'неизвестно')
    // console.log('Всего элементов:', response.page?.totalElements || response.totalElements || 'неизвестно')
    // console.log('Последняя страница?', response.last || false)
    console.groupEnd()
  }

  const checkDuplicates = (comments: any[]) => {
    const ids = comments.map((c) => c.id)
    const uniqueIds = new Set(ids)
    const duplicates = ids.length - uniqueIds.size

    if (duplicates > 0) {
      console.warn(`⚠️ Обнаружено ${duplicates} дубликатов!`)

      // Находим какие именно ID дублируются
      const idCounts = ids.reduce(
        (acc, id) => {
          acc[id] = (acc[id] || 0) + 1
          return acc
        },
        {} as Record<number, number>
      )

      const duplicatedIds = Object.entries(idCounts)
        .filter(([_, count]) => Number(count) > 1)
        .map(([id, count]) => ({id: Number(id), count}))

      console.table(duplicatedIds)
    }

    return {
      uniqueCount: uniqueIds.size,
      duplicateCount: duplicates,
      uniqueIds: Array.from(uniqueIds)
    }
  }

  const logState = (state: {
    comments: any[]
    currentPage: number
    totalPages: number
    hasMore: boolean
    loadedPages: Set<number>
  }) => {
    const duplicateInfo = checkDuplicates(state.comments)

    console.group('📊 Состояние пагинации')
    // console.log('Текущая страница:', state.currentPage)
    // console.log('Всего страниц:', state.totalPages)
    // console.log('Загружено страниц:', Array.from(state.loadedPages).sort())
    // console.log('Есть еще страницы?', state.hasMore)
    // console.log('Всего комментариев:', state.comments.length)
    // console.log('Уникальных комментариев:', duplicateInfo.uniqueCount)
    // console.log('Дубликатов:', duplicateInfo.duplicateCount)
    console.groupEnd()
  }

  const logError = (error: any, context: string) => {
    console.error(`❌ Ошибка в ${context}:`, error)
  }

  return {
    logPageLoad,
    checkDuplicates,
    logState,
    logError
  }
}

// Использование в компоненте:
// const debugger = createPaginationDebugger()
// debugger.logPageLoad(page, response)
// debugger.logState({ comments, currentPage, totalPages, hasMore, loadedPages })
