/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useCallback} from 'react'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import dynamic from 'next/dynamic'

const Markdown = dynamic(() => import('react-markdown'), {ssr: false, loading: () => <div>loading...</div>})
const processMarkdown = (markdown: string) => {
  if (!markdown) return ''

  const processed = markdown
    // 1. Нормализация Unicode символов
    .replace(/[－—–]/g, '-')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/！/g, '!')
    .replace(/。/g, '.')
    .replace(/＊/g, '*')
    .replace(/▪/g, '-')
    .replace(/→/g, ' → ') // Добавляем пробелы вокруг стрелки

    // 2. Исправляем сломанные заголовки
    .replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2')

    // 3. Исправляем сложные сломанные списки
    .replace(/^([*-]|\d+\.)\s*$/gm, '') // Удаляет пустые пункты списка
    .replace(/^([*-]|\d+\.)\s+([\s\u00A0]+)$/gm, '') // Удаляет пункты только с пробелами/неразрывными пробелами
    .replace(/^(\s{2,})([*-]|\d+\.)\s*$/gm, '') // "-*" -> "- "

    // 4. Убираем пустые элементы списков и блоки кода с пустыми элементами
    .replace(/^-\*(.+)$/gm, '- $1')
    .replace(/^--\*(.+)$/gm, '  - $1')
    .replace(/^---(.+)$/gm, '    - $1')
    .replace(/^-\s*-(.+)$/gm, '  - $1')
    .replace(/^-\s*\*/g, '- ')
    // 5. Исправляем блоки кода с содержимым
    .replace(/```\s*\n([^`]*?)\n\s*```/g, (match, content) => {
      const trimmed = content.trim()
      if (!trimmed || trimmed === '-') return '' // Убираем пустые блоки

      // Если содержимое блока - это обычный текст, не код, выносим его наружу
      if (!trimmed.includes('\n') && !trimmed.match(/^[\s\-\*#]/)) {
        return `\n${trimmed}\n`
      }

      return trimmed ? `\n\`\`\`\n${trimmed}\n\`\`\`\n` : ''
    })

    // 6. Исправляем проблемы с форматированием (жирный, курсив)
    .replace(/\*\*([^*]+)\*\*/g, '**$1**') // Нормализуем жирный текст
    .replace(/\*([^*\s][^*]*[^*\s])\*/g, '*$1*') // Нормализуем курсив

    // 7. Исправляем зачеркнутый текст
    .replace(/~~([^~]+)~~/g, '~~$1~~')

    // 8. Исправляем нумерацию в стиле "1. text 3.2. text"
    .replace(/(\d+)\.\s*(.+?)\s+(\d+)\.(\d+)\.\s*\*\*(.+?)\*\*/g, '$1. $2\n$3. **$5**')

    // 9. Исправляем списки со звездочками
    .replace(/^\*\s*(.+)$/gm, '- $1')

    // 10. Исправляем заголовки после списков
    .replace(/^\s*-\s*###/gm, '\n### ')

    // 11. Обрабатываем кастомные выделения ==text==
    .replace(/==([^=]*?)==/g, (match, p1) => {
      const trimmed = p1.replace(/^\s+|\s+$/g, '')
      return `<span class="borderText">${trimmed}</span>`
    })

    // 12. Убираем множественные пустые строки
    .replace(/\n{3,}/g, '\n\n')

    // 13. Исправляем структуру после всех преобразований
    .split('\n')
    .filter((line) => {
      // Убираем совсем пустые строки, которые не несут смысла
      const trimmed = line.trim()
      return trimmed !== '' || line === '' // Оставляем только значимые пустые строки для разделения
    })
    .map((line, index, array) => {
      // Добавляем пустые строки перед списками если нужно
      if (line.match(/^-\s+/) && index > 0) {
        const prevLine = array[index - 1].trim()
        if (prevLine && !prevLine.match(/^[-*]\s+/) && !prevLine.match(/^#{1,6}\s+/)) {
          return '\n' + line
        }
      }
      return line
    })
    .join('\n')

    // 14. Финальная очистка
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return processed
}

interface IShowMarkdownProps {
  markValue: string | null
}

const ShowMarkdown: FC<IShowMarkdownProps> = ({markValue}) => {
  // Добавляем проверку на валидность строки
  if (!markValue || typeof markValue !== 'string') {
    return <div className='mark_box'></div>
  }

  const processedMarkdown = processMarkdown(markValue)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleClick = useCallback(async (event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    // Используем textContent вместо innerText для лучшей поддержки Unicode
    const originalText = target.textContent || target.innerText

    try {
      await navigator.clipboard.writeText(originalText)
      target.textContent = 'Скопировано!'
      setTimeout(() => {
        target.textContent = originalText
      }, 1000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
      // Fallback для старых браузеров
      try {
        const textArea = document.createElement('textarea')
        textArea.value = originalText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        target.textContent = 'Скопировано!'
        setTimeout(() => {
          target.textContent = originalText
        }, 1000)
      } catch (fallbackErr) {
        console.error('Fallback копирование тоже не удалось:', fallbackErr)
      }
    }
  }, [])

  return (
    <div
      className='mark_box'
      style={{
        unicodeBidi: 'normal',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Noto Sans TC", "Microsoft YaHei", sans-serif'
      }}
    >
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({node, children, ...props}) => {
            return (
              <div className='table-wrapper'>
                <table {...props}>{children}</table>
              </div>
            )
          },
          // Исправляем рендеринг списков для китайского текста
          ul: ({node, children, ...props}) => (
            <ul {...props} style={{listStyleType: 'disc', paddingLeft: '20px'}}>
              {children}
            </ul>
          ),
          li: ({node, children, ...props}) => (
            <li {...props} style={{marginBottom: '4px', wordBreak: 'break-word'}}>
              {children}
            </li>
          ),
          // Исправляем обработку зачеркнутого текста
          del: ({node, children, ...props}) => (
            <del {...props} style={{textDecoration: 'line-through', opacity: 0.7}}>
              {children}
            </del>
          ),
          span: ({node, className, children, ...props}) => {
            if (className === 'borderText') {
              return (
                <span
                  {...props}
                  className={className}
                  onClick={handleClick}
                  style={{
                    cursor: 'pointer',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid #ccc',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {children}
                </span>
              )
            }
            return <span {...props}>{children}</span>
          }
        }}
      >
        {processedMarkdown}
      </Markdown>
    </div>
  )
}

export default ShowMarkdown
