import React, {useState} from 'react'
import MultiDropSelect, {MultiSelectOption} from './MultiDropSelect'

// Пример использования MultiDropSelect
const MultiDropSelectExample = () => {
  // Пример опций для выбора
  const categoryOptions: MultiSelectOption[] = [
    {id: 1, label: 'Электроника', value: 'electronics'},
    {id: 2, label: 'Одежда и обувь', value: 'clothing'},
    {id: 3, label: 'Дом и сад', value: 'home'},
    {id: 4, label: 'Спорт и отдых', value: 'sport'},
    {id: 5, label: 'Красота и здоровье', value: 'beauty'},
    {id: 6, label: 'Автотовары', value: 'auto'},
    {id: 7, label: 'Книги', value: 'books', icon: '/icons/books.svg'},
    {id: 8, label: 'Детские товары', value: 'kids', icon: '/icons/kids.svg'}
  ]

  // Состояние для выбранных категорий
  const [selectedCategories, setSelectedCategories] = useState<MultiSelectOption[]>([])

  // Пример характеристик товара
  const characteristicsOptions: MultiSelectOption[] = [
    {id: 'size-s', label: 'Размер S', value: 'size-s'},
    {id: 'size-m', label: 'Размер M', value: 'size-m'},
    {id: 'size-l', label: 'Размер L', value: 'size-l'},
    {id: 'color-red', label: 'Красный', value: 'color-red'},
    {id: 'color-blue', label: 'Синий', value: 'color-blue'},
    {id: 'color-black', label: 'Черный', value: 'color-black'}
  ]

  const [selectedCharacteristics, setSelectedCharacteristics] = useState<MultiSelectOption[]>([])

  return (
    <div style={{maxWidth: '400px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div>
        <h3 style={{marginBottom: '12px'}}>Выберите категории товаров:</h3>
        <MultiDropSelect
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={setSelectedCategories}
          placeholder='Выберите категории...'
        />
        <p style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
          Выбрано категорий: {selectedCategories.length}
        </p>
      </div>

      <div>
        <h3 style={{marginBottom: '12px'}}>Характеристики товара:</h3>
        <MultiDropSelect
          options={characteristicsOptions}
          selectedValues={selectedCharacteristics}
          onChange={setSelectedCharacteristics}
          placeholder='Выберите характеристики...'
        />
        {selectedCharacteristics.length > 0 && (
          <div style={{marginTop: '8px', fontSize: '14px'}}>
            <strong>Выбрано:</strong> {selectedCharacteristics.map((char) => char.label).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiDropSelectExample
