// src/app/api/recaptchaSubmit/route.ts
import {NextResponse} from 'next/server'

export async function POST(request: Request) {
  console.log('API endpoint called:', request.method, request.url)

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY не найден в environment variables')
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      })
    }

    const postData = await request.json()
    const {gRecaptchaToken} = postData

    if (!gRecaptchaToken) {
      console.error('gRecaptchaToken отсутствует в запросе')
      return NextResponse.json({
        success: false,
        error: 'Missing reCAPTCHA token'
      })
    }

    console.log('Отправляем запрос к Google reCAPTCHA API...')

    // Формируем данные для отправки
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', gRecaptchaToken)

    // Отправляем запрос к официальному Google API
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    const result = await response.json()

    console.log('Ответ от Google reCAPTCHA:', {
      success: result.success,
      score: result.score,
      action: result.action,
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
      'error-codes': result['error-codes']
    })

    // Проверяем результат
    if (result.success && result.score > 0.5) {
      return NextResponse.json({
        success: true,
        score: result.score
      })
    } else {
      console.error('reCAPTCHA проверка не пройдена:', {
        success: result.success,
        score: result.score,
        errors: result['error-codes']
      })

      return NextResponse.json({
        success: false,
        error: 'reCAPTCHA verification failed',
        details: result['error-codes'] || ['Low score or verification failed']
      })
    }
  } catch (error) {
    console.error('Ошибка при проверке reCAPTCHA:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error during reCAPTCHA verification'
    })
  }
}
