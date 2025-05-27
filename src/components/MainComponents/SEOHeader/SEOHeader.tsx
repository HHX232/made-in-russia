/* eslint-disable @next/next/no-html-link-for-pages */
// components/SEO/PureSEOHeader.tsx

export default function PureSEOHeader() {
  return (
    <header
      className='seo-header'
      style={{
        zIndex: -100000,
        opacity: 0,
        position: 'absolute',
        top: '-400vh',
        left: '-400vw'
      }}
    >
      {/* Верхняя часть с контактами */}
      <div className='header-top'>
        <div className='container'>
          <ul className='contacts-list'>
            <li>
              <a href='https://www.instagram.com/made-in-russia' target='_blank' rel='noopener noreferrer'>
                <img src='/insta.svg' alt='Instagram' width='24' height='24' />
                made-in-russia
              </a>
            </li>
            <li>
              <a href='https://t.me/made_in_russia' target='_blank' rel='noopener noreferrer'>
                <img src='/telegram.svg' alt='Telegram' width='24' height='24' />
                made_in_russia
              </a>
            </li>
            <li>
              <a href='tel:88005553535' target='_blank' rel='noopener noreferrer'>
                <img src='/phone.svg' alt='Телефон' width='24' height='24' />8 (800) 555-35-35
              </a>
            </li>
          </ul>
          <div className='language-selector'>
            <span>RU</span>
          </div>
        </div>
      </div>

      {/* Средняя часть с логотипом и навигацией */}
      <div className='header-middle'>
        <div className='container'>
          <a href='/' className='logo-link'>
            <img src='/Logo_Bear.svg' alt='Logo with Bear' width='69' height='69' />
            <img src='/logoText.svg' alt='Made In Russia' width='175' height='41' />
          </a>

          <form action='/search' method='GET' className='search-form'>
            <input type='search' name='q' placeholder='Поиск товаров...' className='search-input' />
            <button type='submit' className='search-button'>
              Поиск
            </button>
          </form>

          <nav className='user-nav'>
            <a href='/profile' className='nav-link'>
              Профиль
            </a>
            <a href='/cart' className='nav-link'>
              Корзина
            </a>
            <a href='/favorites' className='nav-link'>
              Избранное
            </a>
          </nav>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className='header-bottom'>
        <div className='container'>
          <nav className='main-nav'>
            <ul>
              <li>
                <a href='/catalog'>Каталог</a>
              </li>
              <li>
                <a href='/reviews'>Отзывы</a>
              </li>
              <li>
                <a href='/delivery'>Доставка</a>
              </li>
              <li>
                <a href='/about'>О нас</a>
              </li>
              <li>
                <a href='/help'>Помощь</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Дополнительные SEO ссылки */}
      <nav className='seo-navigation' style={{display: 'none'}}>
        <h2>Навигация по сайту</h2>
        <ul>
          <li>
            <a href='/'>Главная</a>
          </li>
          <li>
            <a href='/catalog'>Каталог товаров</a>
          </li>
          <li>
            <a href='/category/wood'>Древесина</a>
          </li>
          <li>
            <a href='/category/furniture'>Мебель</a>
          </li>
          <li>
            <a href='/category/textiles'>Текстиль</a>
          </li>
          <li>
            <a href='/reviews'>Отзывы покупателей</a>
          </li>
          <li>
            <a href='/delivery'>Доставка и оплата</a>
          </li>
          <li>
            <a href='/about'>О компании</a>
          </li>
          <li>
            <a href='/contact'>Контактная информация</a>
          </li>
          <li>
            <a href='/help'>Помощь и поддержка</a>
          </li>
          <li>
            <a href='/sitemap'>Карта сайта</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
