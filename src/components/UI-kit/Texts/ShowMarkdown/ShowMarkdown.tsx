/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useCallback} from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import rehypeRaw from 'rehype-raw'

const processMarkdown = (markdown: string) => {
  return markdown.replace(/==([^=]+)==/g, (match, p1) => {
    return `<span class="borderText">${p1.trim()}</span>`
  })
}

interface IShowNarkdwonProps {
  markValue: string | null
}

const ShowMarkdown: FC<IShowNarkdwonProps> = ({markValue}) => {
  const processedMarkdown = processMarkdown(markValue || '')

  const handleClick = useCallback(async (event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const originalText = target.innerText

    try {
      await navigator.clipboard.writeText(originalText)
      target.innerText = 'Скопировано!'
      setTimeout(() => {
        target.innerText = originalText
      }, 1000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }, [])

  return (
    <div className='mark_box'>
      <Markdown
        rehypePlugins={[rehypeRaw, remarkGfm, remarkParse]}
        components={{
          table: ({node, children, ...props}) => {
            return (
              <div className='table-wrapper'>
                <table {...props}>{children}</table>
              </div>
            )
          },
          span: ({node, className, children, ...props}) => {
            if (className === 'borderText') {
              return (
                <span {...props} className={className} onClick={handleClick}>
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
