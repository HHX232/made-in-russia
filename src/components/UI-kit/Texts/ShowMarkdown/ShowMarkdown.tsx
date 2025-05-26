/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {FC, useCallback} from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
// @ts-ignore
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// @ts-ignore
import {a11yDark} from 'react-syntax-highlighter/dist/esm/styles/prism'

const markdown = `
 пишем текст текст текст == Whereas recogni == <- скопируется при нажатии

---
<a href="https://api64w.ilovepdf.com/v1/download/84tr3zp3v3m94jy08xrjygkjsp8c0x3b2qngqnfz4rAd569Ag1y1t44v01r2wvl3bz7q93wr5hml3dt7xllq3c5dnlb6kjtp1twfrfw4mz6r6km9f4yfth4kgp8yrq1yAndqsz50xdbf1n1s5f4wc98qsv58mk5bv5hAmpn1jpz2bwrdwvb1" download>Скачать PDF файл</a>

</div>

== Whereas recogni ==
== Whereas recogni ==
== Whereas recogni ==

текст текст текст
текст текст текст


текст текст текст


---

# Mastering the Art of Programming: A Journey from Beginner to Expert

[Простая ссылка](https://docs.google.com/document/d/1HM-jQmJSJi0HkteKZzRK9WPNFR1ctqurttNIq__Qx4s/edit?usp=drive_link)

[Ссылка с подсказкой](https://example.com "Подсказка при наведении")

---

## Изображения

![Текст если изображение не загрузилось](https://images.pexels.com/photos/29743804/pexels-photo-29743804.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load)

---


## Списки
<b>BOLD TAG</b>
### Маркированный список:
- Элемент 1
  - Подэлемент 1.1
  
- Элемент 2
- Элемент 3

### Нумерованный список:
1. Элемент 1

    2. Подэлемент 1.1
    
    2. Элемент 2

3. Элемент 3

---

## Таблицы


| Заголовок 1 | Заголовок 2 | Заголовок 3 | Заголовок 4 |
|-------------|-------------|-------------|-------------|
| Ячейка 1    | Ячейка 2    | Ячейка 3    |             |
| Ячейка 4    | Ячейка 5    | Ячейка 6    |             |

---
<div class="table_wrapper">
<table>
<colgroup>
<col style="width: 10%" />
<col style="width: 28%" />
<col style="width: 10%" />
<col style="width: 10%" />
<col style="width: 28%" />
<col style="width: 10%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="3">Кратные</th>
<th colspan="3">Дольные</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>10<sup>1</sup></p>
<p>10<sup>2</sup></p>
<p>10<sup>3</sup></p>
<p>10<sup>6</sup></p>
<p>10<sup>9</sup></p>
<p>10<sup>12</sup></p></td>
<td><p>дека</p>
<p>гекто</p>
<p>кило</p>
<p>мега</p>
<p>гига</p>
<p>тера</p></td>
<td><p>[да]</p>
<p>[г]</p>
<p>[к]</p>
<p>[М]</p>
<p>[Г]</p>
<p>[Т]</p></td>
<td><p>10<sup>-1</sup></p>
<p>10<sup>-2</sup></p>
<p>10<sup>-3</sup></p>
<p>10<sup>-6</sup></p>
<p>10<sup>-9</sup></p>
<p>10<sup>-12</sup></p></td>
<td><p>деци</p>
<p>санти</p>
<p>мили</p>
<p>микро</p>
<p>нано</p>
<p>пико</p></td>
<td><p>[д]</p>
<p>[с]</p>
<p>[м]</p>
<p>[мк]</p>
<p>[н]</p>
<p>[п]</p></td>
</tr>
</tbody>
</table>
</div>

== текст bordered ==

## Цитаты

> Это пример цитаты.  
> Цитаты могут быть многострочными.  

---

## Чек-листы

- [x] Завершённый элемент
- [ ] Незавершённый элемент

---

## Горизонтальная линия

---
---

## Встраивание HTML

Можно вставить HTML:

<div style="background-color: lightblue; padding: 10px;">
  Это блок с HTML внутри Markdown.
</div>
`

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
        rehypePlugins={[rehypeRaw, remarkGfm]}
        components={{
          // ...ваш существующий код для code...
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
