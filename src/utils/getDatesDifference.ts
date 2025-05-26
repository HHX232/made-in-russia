interface DateDifferenceParams {
  startDate: Date | string | number // Добавляем number для поддержки timestamp
  endDate: Date | string | number | null | undefined // Добавляем null и undefined для опциональных полей
}

const getDatesDifference = ({startDate, endDate}: DateDifferenceParams): number | null => {
  // Обрабатываем случай, когда endDate не указан
  if (endDate === null || endDate === undefined) {
    return null
  }

  // Преобразуем входные данные в объекты Date
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Проверяем валидность дат
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null
  }

  const differenceInMs = end.getTime() - start.getTime()

  return Math.floor(differenceInMs / (1000 * 60 * 60 * 24))
}
export default getDatesDifference
