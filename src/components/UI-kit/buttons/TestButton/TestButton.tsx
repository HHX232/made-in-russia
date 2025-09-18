'use client'
import {useState} from 'react'

export default function TestButton() {
  const [response, setResponse] = useState<string | null>(null)

  const handleClick = async () => {
    try {
      const res = await fetch('/backend/test', {method: 'GET'})
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Ошибка при запросе:', error)
      setResponse('Ошибка запроса')
    }
  }

  return (
    <div className='p-4'>
      <button onClick={handleClick} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
        Проверить API
      </button>

      {response && <pre className='mt-4 p-2 bg-gray-100 rounded'>{response}</pre>}
    </div>
  )
}
