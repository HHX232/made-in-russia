/* eslint-disable @typescript-eslint/no-explicit-any */
// types/css.d.ts
declare module '*.css' {
  const content: any
  export default content
}

declare module '*.scss' {
  const content: any
  export default content
}

// Специфичные модули
declare module 'react-loading-skeleton/dist/skeleton.css'
declare module 'slick-carousel/slick/slick.css'
declare module 'slick-carousel/slick/slick-theme.css'
// declare module 'md-editor-rt/lib/style.css'
