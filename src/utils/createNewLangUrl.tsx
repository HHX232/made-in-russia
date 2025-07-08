function createNewLangUrl(newLang: 'ru' | 'en' | 'zh', currentPath: string) {
  const pathWithoutLang = currentPath.replace(/\/(ru|en|zh)/, '')
  return `/${newLang}${pathWithoutLang}`
}

export default createNewLangUrl
