'use client'
import React, {useState, useRef, useEffect} from 'react'
import {Bold, Italic, Underline, List, ListOrdered, Minus, Eye, EyeOff} from 'lucide-react'
import styles from './MarkdownEditor.module.scss'
import {useTranslations} from 'next-intl'
import {marked} from 'marked'

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

  // handleEnter logic for lists remains the same as original
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !readOnly) {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const beforeCursor = content.substring(0, start)
      const currentLineStart = beforeCursor.lastIndexOf('\n') + 1
      const currentLine = beforeCursor.substring(currentLineStart)

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

  // Insert markdown helpers remain the same
  const insertMarkdown = (before: string, after: string = '') => {
    if (readOnly) return
    const textarea = textareaRef.current
    if (!textarea) return

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
    if (readOnly) return
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const currentLineStart = content.substring(0, start).lastIndexOf('\n') + 1
    const newText = content.substring(0, currentLineStart) + prefix + content.substring(currentLineStart)

    handleContentChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  const handleBold = () => insertMarkdown('<b>', '</b>')
  const handleItalic = () => insertMarkdown('<i>', '</i>')
  const handleUnderline = () => insertMarkdown('<u>', '</u>')

  const handleUnorderedList = () => {
    if (readOnly) return
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (start !== end && selectedText.includes('\n')) {
      const lines = selectedText.split('\n')
      const newLines = lines.map((line) => (line.trim() ? '- ' + line : line))
      const newText = content.substring(0, start) + newLines.join('\n') + content.substring(end)
      handleContentChange(newText)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + newLines.join('\n').length)
      }, 0)
    } else {
      insertAtLineStart('- ')
    }
  }

  const handleOrderedList = () => {
    if (readOnly) return
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (start !== end && selectedText.includes('\n')) {
      const lines = selectedText.split('\n')
      const newLines = lines.map((line, index) => (line.trim() ? `${index + 1}. ${line}` : line))
      const newText = content.substring(0, start) + newLines.join('\n') + content.substring(end)
      handleContentChange(newText)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + newLines.join('\n').length)
      }, 0)
    } else {
      insertAtLineStart('1. ')
    }
  }

  const handleHorizontalLine = () => {
    if (readOnly) return
    const textarea = textareaRef.current
    if (!textarea) return

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

  // Use "marked" for safe and correct markdown parsing to HTML including multiline bold
  const createMarkup = (text: string) => {
    const html = marked.parse(text, {breaks: true}) // breaks to preserve new lines as <br>
    return {__html: html}
  }

  return (
    <div className={`${styles.editorGrid} ${extraClass}`}>
      {!readOnly && (
        <div className={styles.editorPanel}>
          <div className={styles.editorCard}>
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
            <div className={styles.preview} dangerouslySetInnerHTML={createMarkup(content)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MarkdownEditor
