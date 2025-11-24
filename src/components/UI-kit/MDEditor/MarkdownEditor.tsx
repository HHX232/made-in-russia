/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, {useState, useRef, JSX, useEffect} from 'react'
import {Bold, Italic, Underline, List, ListOrdered, Minus, Eye, EyeOff} from 'lucide-react'
import styles from './MarkdownEditor.module.scss'
import {useTranslations} from 'next-intl'

interface MarkdownEditorProps {
  initialValue?: string
  onValueChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  initialHidePreview?: boolean
  extraClass?: string
  extraPreviewClass?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  onValueChange,
  readOnly = false,
  placeholder = 'Начните вводить текст...',
  initialHidePreview = true,
  extraClass,
  extraPreviewClass
}) => {
  const [content, setContent] = useState(initialValue)
  const [showPreview, setShowPreview] = useState(!initialHidePreview)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = useTranslations('mdEditor')
  const handleContentChange = (value: string) => {
    setContent(value)
    onValueChange?.(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !readOnly) {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const beforeCursor = content.substring(0, start)
      const currentLineStart = beforeCursor.lastIndexOf('\n') + 1
      const currentLine = beforeCursor.substring(currentLineStart)

      // Проверка на нумерованный список
      const orderedMatch = currentLine.match(/^(\d+)\.\s/)
      if (orderedMatch) {
        e.preventDefault()
        const nextNumber = parseInt(orderedMatch[1]) + 1
        const newText = content.substring(0, start) + '\n' + nextNumber + '. ' + content.substring(start)

        handleContentChange(newText)

        setTimeout(() => {
          const newPos = start + nextNumber.toString().length + 3
          textarea.setSelectionRange(newPos, newPos)
        }, 0)
        return
      }

      // Проверка на маркированный список
      if (currentLine.startsWith('- ')) {
        e.preventDefault()
        const newText = content.substring(0, start) + '\n- ' + content.substring(start)

        handleContentChange(newText)

        setTimeout(() => {
          const newPos = start + 3
          textarea.setSelectionRange(newPos, newPos)
        }, 0)
        return
      }
    }
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea || readOnly) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    handleContentChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea || readOnly) return

    const start = textarea.selectionStart
    const currentLineStart = content.substring(0, start).lastIndexOf('\n') + 1

    const newText = content.substring(0, currentLineStart) + prefix + content.substring(currentLineStart)

    handleContentChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  const handleBold = () => insertMarkdown('**', '**')
  const handleItalic = () => insertMarkdown('*', '*')
  const handleUnderline = () => insertMarkdown('<u>', '</u>')
  const handleUnorderedList = () => insertAtLineStart('- ')
  const handleOrderedList = () => insertAtLineStart('1. ')
  const handleHorizontalLine = () => {
    const textarea = textareaRef.current
    if (!textarea || readOnly) return

    const start = textarea.selectionStart
    const beforeCursor = content.substring(0, start)
    const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n')

    const insertion = (needsNewlineBefore ? '\n' : '') + '---\n'
    const newText = beforeCursor + insertion + content.substring(start)

    handleContentChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertion.length, start + insertion.length)
    }, 0)
  }

  useEffect(() => {
    setContent(initialValue)
  }, [initialValue])

  const parseMarkdown = (text: string) => {
    const lines = text.split('\n')
    const result: JSX.Element[] = []
    let currentList: {type: 'ul' | 'ol'; items: JSX.Element[]} | null = null
    let listKey = 0

    lines.forEach((line, i) => {
      if (line === '---') {
        if (currentList) {
          result.push(
            currentList.type === 'ul' ? (
              <ul key={`list-${listKey++}`}>{currentList.items}</ul>
            ) : (
              <ol key={`list-${listKey++}`}>{currentList.items}</ol>
            )
          )
          currentList = null
        }
        result.push(<hr key={i} />)
        return
      }

      const parsed = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')

      if (line.match(/^\d+\.\s/)) {
        const content = parsed.replace(/^\d+\.\s/, '')
        const item = <li key={i} dangerouslySetInnerHTML={{__html: content}} />

        if (currentList?.type === 'ol') {
          currentList.items.push(item)
        } else {
          if (currentList) {
            result.push(<ul key={`list-${listKey++}`}>{currentList.items}</ul>)
          }
          currentList = {type: 'ol', items: [item]}
        }
        return
      }

      if (line.startsWith('- ')) {
        const content = parsed.substring(2)
        const item = <li key={i} dangerouslySetInnerHTML={{__html: content}} />

        if (currentList?.type === 'ul') {
          currentList.items.push(item)
        } else {
          if (currentList) {
            result.push(<ol key={`list-${listKey++}`}>{currentList.items}</ol>)
          }
          currentList = {type: 'ul', items: [item]}
        }
        return
      }

      if (currentList) {
        result.push(
          currentList.type === 'ul' ? (
            <ul key={`list-${listKey++}`}>{currentList.items}</ul>
          ) : (
            <ol key={`list-${listKey++}`}>{currentList.items}</ol>
          )
        )
        currentList = null
      }

      if (line.trim() === '') {
        result.push(<br key={i} />)
        return
      }

      result.push(<p key={i} dangerouslySetInnerHTML={{__html: parsed}} />)
    })

    if (currentList) {
      result.push(
        (currentList as any).type === 'ul' ? (
          <ul key={`list-${listKey++}`}>{(currentList as any).items}</ul>
        ) : (
          <ol key={`list-${listKey++}`}>{(currentList as any).items}</ol>
        )
      )
    }

    return result
  }

  return (
    <div className={`${styles.editorGrid} ${extraClass}`}>
      {!readOnly && (
        <div className={styles.editorPanel}>
          <div className={styles.editorCard}>
            {!readOnly && (
              <div className={styles.toolbar}>
                <button type='button' onClick={handleBold} className={styles.toolbarButton} title={t('bold')}>
                  <Bold size={18} />
                </button>
                <button type='button' onClick={handleItalic} className={styles.toolbarButton} title={t('curs')}>
                  <Italic size={18} />
                </button>
                <button type='button' onClick={handleUnderline} className={styles.toolbarButton} title={t('underline')}>
                  <Underline size={18} />
                </button>
                <div className={styles.divider} />
                <button
                  type='button'
                  onClick={handleUnorderedList}
                  className={styles.toolbarButton}
                  title={t('markList')}
                >
                  <List size={18} />
                </button>
                <button
                  type='button'
                  onClick={handleOrderedList}
                  className={styles.toolbarButton}
                  title={t('numerickList')}
                >
                  <ListOrdered size={18} />
                </button>
                <div className={styles.divider} />
                <button
                  type='button'
                  onClick={handleHorizontalLine}
                  className={styles.toolbarButton}
                  title={t('horizontalLine')}
                >
                  <Minus size={18} />
                </button>
                <div className={styles.divider} />
                <button
                  type='button'
                  onClick={() => setShowPreview(!showPreview)}
                  className={styles.toolbarButton}
                  title={showPreview ? t('hidePrev') : t('showPrev')}
                >
                  {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* Используйте ваш TextAreaUI здесь */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.textarea}
              placeholder={placeholder}
              readOnly={readOnly}
            />
          </div>
        </div>
      )}

      {(showPreview || readOnly) && (
        <div className={`${styles.editorPane} ${extraPreviewClass}`}>
          <div className={styles.previewCard}>
            {!readOnly && <h2 className={styles.previewTitle}>{t('preview')}</h2>}
            <div className={styles.preview}>
              {content ? (
                parseMarkdown(content)
              ) : (
                <p className={styles.previewPlaceholder}>{readOnly ? t('dontHaveDescr') : t('previewPlaceholder')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarkdownEditor
