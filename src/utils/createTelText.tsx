const createTelText = (phoneNumber?: string): string => {
  // Получаем номер из переменной окружения или используем дефолтный
  const rawNumber = phoneNumber || '88005553535'

  // Удаляем все нецифровые символы
  const cleaned = rawNumber.replace(/\D/g, '')

  // Проверяем длину номера и форматируем соответствующим образом
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    // Формат для 8XXXXXXXXXX → +7 XXX XXX-XX-XX
    return `+7 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('7')) {
    // Формат для 7XXXXXXXXXX → +7 XXX XXX-XX-XX
    return `+7 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`
  } else if (cleaned.length === 10) {
    // Формат для XXXXXXXXXX → +7 XXX XXX-XX-XX (добавляем код страны)
    return `+7 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`
  }

  // Если номер не соответствует стандартным форматам, возвращаем как есть
  return cleaned
}
export default createTelText
