'use client'
import {FC} from 'react'

const processMarkdown = (markdown: string) => {
  if (!markdown) return ''

  const processed = markdown
    .replace(/[－—–]/g, '-')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/！/g, '!')
    .replace(/。/g, '.')
    .replace(/＊/g, '*')
    .replace(/▪/g, '-')
    .replace(/→/g, ' → ')
    .replace(/^(#{1,6})\s*(.+)$/gm, '$2')
    .replace(/^([*-]|\d+\.)\s*$/gm, '')
    .replace(/^([*-]|\d+\.)\s+([\s\u00A0]+)$/gm, '')
    .replace(/```[\s\S]*?```/g, '') // убираем блоки кода целиком
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\s][^*]*[^*\s])\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/==([^=]*?)==/g, '$1')
    .replace(/^\*\s*(.+)$/gm, '$1')
    .replace(/^\s*-\s*###/gm, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return processed
}

interface IShowMarkdownProps {
  markValue: string | null
}

const ShowMarkdown: FC<IShowMarkdownProps> = ({markValue}) => {
  if (!markValue || typeof markValue !== 'string') {
    return <div className='mark_box'></div>
  }

  const processedMarkdown = processMarkdown(markValue)

  return (
    <div
      className='mark_box'
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Noto Sans TC", "Microsoft YaHei", sans-serif'
      }}
    >
      {processedMarkdown}
    </div>
  )
}

export default ShowMarkdown
