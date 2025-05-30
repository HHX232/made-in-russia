import {FC} from 'react'
import styles from './CardMiddlePage.module.scss'
import ShowMarkdown from '@/components/UI-kit/Texts/ShowMarkdown/ShowMarkdown'
import StringDescriptionGroup from '@/components/UI-kit/Texts/StringDescriptionGroup/StringDescriptionGroup'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import ICardFull from '@/services/card/card.types'
const markExample1 = `**Применение:**  
Применение:  Паркетные полы, мебельное производство, отделка интерьеров, строительство террас, декоративные панели.
<span style="color: #2E4053; font-weight: 500;">Паркетные полы, мебельные фасады, лестницы, декоративные стеновые панели.</span>  
 пишем текст текст текст == Whereas recogni == <- Скопировали

  пишем текст текст текст == Whereas recogni == <- Скопировали



**Сертификация:**  
<span style="color: #1A5276; font-style: italic;">FSC, 14001, EUTR.</span><span style="color: #a22d2d; font-style: italic;"> PEFC, ISO.</span>  

**Транспортировка:**  
- <span style=" padding: 2px 14px;">Морские контейнеры</span> (20'/40' HQ, влагозащитная упаковка).  
- <span style=" padding: 2px 4px;">Автоперевозки</span> (еврофуры, доставка по СНГ/ЕС).  
- Инкотермс: <span style="text-decoration: underline;">FOB, CIF, DAP</span> (2020).  

**Преимущества:**  
🔹 <span style="color: #7D6608;">Эстетика</span> — редкий радиальный распил с шелковистым блеском.  
🔹 <span style="color: #7D6608;">Долговечность</span> — плотность 720 кг/м³, устойчивость к деформациям.  
🔹 <span style="color: #7D6608;">Экология</span> — сертифицированная древесина с нулевым VOC.  
🔹 <span style="color: #7D6608;">Гибкость</span> — совместимость с системами подогрева пола.  `

const markExample2 = `**Дополнение:**  
<a href="https://api64w.ilovepdf.com/v1/download/84tr3zp3v3m94jy08xrjygkjsp8c0x3b2qngqnfz4rAd569Ag1y1t44v01r2wvl3bz7q93wr5hml3dt7xllq3c5dnlb6kjtp1twfrfw4mz6r6km9f4yfth4kgp8yrq1yAndqsz50xdbf1n1s5f4wc98qsv58mk5bv5hAmpn1jpz2bwrdwvb1" download>Скачать PDF файл</a>


== Whereas recogni ==


| Характеристика       | Дуб натуральный          | Искусственный камень    |
|----------------------|--------------------------|-------------------------|
| **Плотность**        | 720 кг/м³               | 1200 кг/м³             |
| **Влагостойкость**   | Средняя (требует защиты)| Высокая                |
| **Термостойкость**   | До 120°C                | До 300°C               |
| **Экологичность**    | 100% натуральный        | Без VOC                |
| **Срок службы**      | 50+ лет                | 25+ лет                |
| **Цветовая гамма**   | Естественные оттенки   | Любой RAL              |

**Новая таблица способ2**

<div >
  <table>
<colgroup><col style="width: 10%" /></colgroup>
    <thead>
      <tr>
        <th colspan="3" style="background-color: #f5f5f5; text-align: center;">Сравнение материалов</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Применение</strong></td>
        <td>Паркет, мебель, лестницы</td>
        <td>Столешницы, фасады, подоконники</td>
      </tr>
      <tr>
        <td><strong>Твердость (по Моосу)</strong></td>
        <td>3.5–4</td>
        <td>6–7</td>
      </tr>
      <tr>
        <td><strong>Уход</strong></td>
        <td>Воск/масло</td>
        <td>Мыльный раствор</td>
      </tr>
      <tr>
        <td><strong>Цена</strong></td>
        <td>$$$ (элитный сегмент)</td>
        <td>$$ (средний сегмент)</td>
      </tr>
    </tbody>
  </table>
</div>
`
const image1 = '/ads1.jpg'

const CardMiddlePage: FC<{isLoading: boolean; cardData: ICardFull}> = ({isLoading, cardData}) => {
  return (
    <div className={`${styles.card__middle__box}`}>
      <h3
        id='description__title__id'
        style={{marginBottom: isLoading ? '15px' : '0'}}
        className={`${styles.card__middle__title}`}
      >
        Описание
      </h3>
      <div className={`${styles.descr__box}`}>
        <div className={`${styles.mark__span__box}`}>
          {!isLoading ? (
            <ShowMarkdown markValue={cardData.mainDescription || markExample1} />
          ) : (
            <>
              {' '}
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton style={{marginBottom: '5px'}} height={29} count={1} />
              <Skeleton height={29} count={1} />
            </>
          )}
          {!isLoading ? (
            <StringDescriptionGroup
              extraBoxClass={`${styles.extra__group__class}`}
              titleFontSize='16'
              listGap='20'
              items={cardData.characteristics.map((el) => ({title: el.name, value: el.value}))}
              titleMain='Технические характеристики:'
            />
          ) : (
            <></>
          )}
          {!isLoading ? <ShowMarkdown markValue={cardData.furtherDescription || markExample2} /> : <></>}
        </div>
        <div className={`${styles.spec__description__box}`}>
          {!isLoading ? (
            <h3 className={`${styles.spec__description__title}`}>Информация о компании</h3>
          ) : (
            <Skeleton height={29} count={1} style={{marginBottom: '15px'}} />
          )}
          {!isLoading ? (
            <p className={`${styles.spec__description__text}`}>
              Премиальное качество и долговечность Наши дубовые доски изготавливаются из отборной древесины, прошедшей
              многоступенчатую камерную сушку и строгий контроль качества. Благодаря высокой плотности и естественной
              устойчивости дуба к деформации, доски не трескаются, не коробятся и сохраняют безупречный вид
              десятилетиями. Обработка антисептиками и маслами премиум-класса обеспечивает защиту от влаги, грибка и
              насекомых, что делает материал идеальным для использования как внутри помещений, так и на открытом
              воздухе.
            </p>
          ) : (
            <Skeleton height={100} count={1} style={{marginBottom: '15px'}} />
          )}
          <ul className={`${styles.spec__description__images__box}`}>
            <li className={`${styles.spec__description__list_item}`}>
              {!isLoading ? (
                <Image src={image1} alt='' width={170} height={170} />
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px', marginBottom: '10px'}} height={110} />
              )}
              {!isLoading ? (
                <p className={`${styles.spec__description__list_item__image__text}`}> Описание к фотографии</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px'}} height={20} />
              )}
            </li>
            <li className={`${styles.spec__description__list_item}`}>
              {!isLoading ? (
                <Image src={image1} alt='' width={170} height={170} />
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px', marginBottom: '10px'}} height={110} />
              )}
              {!isLoading ? (
                <p className={`${styles.spec__description__list_item__image__text}`}> Описание к фотографии</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px'}} height={20} />
              )}
            </li>
            <li className={`${styles.spec__description__list_item}`}>
              {!isLoading ? (
                <Image src={image1} alt='' width={170} height={170} />
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px', marginBottom: '10px'}} height={110} />
              )}
              {!isLoading ? (
                <p className={`${styles.spec__description__list_item__image__text}`}> Описание к фотографии</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px'}} height={20} />
              )}
            </li>
            <li className={`${styles.spec__description__list_item}`}>
              {!isLoading ? (
                <Image src={image1} alt='' width={170} height={170} />
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px', marginBottom: '10px'}} height={110} />
              )}
              {!isLoading ? (
                <p className={`${styles.spec__description__list_item__image__text}`}> Описание к фотографии</p>
              ) : (
                <Skeleton style={{width: 100000, maxWidth: '170px'}} height={20} />
              )}
            </li>
          </ul>
          {!isLoading ? (
            <p className={`${styles.spec__description__text}`}>
              Премиальное качество и долговечность Наши дубовые доски изготавливаются из отборной древесины, прошедшей
              многоступенчатую камерную сушку и строгий контроль качества.
            </p>
          ) : (
            <Skeleton height={20} count={5} />
          )}
        </div>
      </div>
    </div>
  )
}

export default CardMiddlePage
