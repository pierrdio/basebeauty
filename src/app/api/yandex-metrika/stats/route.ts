import { NextRequest, NextResponse } from 'next/server'

// В реальном приложении здесь нужно получить OAuth токен
const YANDEX_METRIKA_TOKEN = process.env.YANDEX_METRIKA_TOKEN
const COUNTER_ID = 105967815

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '7daysAgo'
    const endDate = searchParams.get('endDate') || 'today'
    const metrics = searchParams.get('metrics') || 'ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds'

    console.log('Yandex Metrika API call:', {
      hasToken: !!YANDEX_METRIKA_TOKEN,
      tokenLength: YANDEX_METRIKA_TOKEN?.length,
      counterId: COUNTER_ID,
      startDate,
      endDate,
      metrics
    })

    if (!YANDEX_METRIKA_TOKEN) {
      // Возвращаем демо-данные для демонстрации работы интерфейса
      return NextResponse.json({
        data: [
          {
            dimensions: [
              { name: "Всего" }
            ],
            metrics: [
              1250,  // visits
              890,   // users
              3200,  // pageviews
              28.5,  // bounceRate
              180    // avgVisitDurationSeconds
            ]
          }
        ],
        query: {
          ids: [COUNTER_ID],
          dimensions: [],
          metrics: metrics.split(','),
          date1: startDate,
          date2: endDate,
          limit: 100,
          offset: 1
        },
        sampleRetention: "FINAL",
        sampleRatio: 100,
        data_lag: 0,
        applied_currency: "RUB",
        timezones: [
          "Europe/Moscow"
        ],
        sampled: false,
        note: "Demo data - configure YANDEX_METRIKA_TOKEN to get real data"
      })
    }

    // Реальный запрос к API Яндекс.Метрики
    const apiUrl = `https://api-metrika.yandex.net/stat/v1/data`
    const params = new URLSearchParams({
      ids: COUNTER_ID.toString(),
      metrics,
      date1: startDate,
      date2: endDate,
      limit: '100',
      offset: '1'
    })

    console.log('Making request to:', `${apiUrl}?${params}`)

    const response = await fetch(`${apiUrl}?${params}`, {
      headers: {
        'Authorization': `OAuth ${YANDEX_METRIKA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Yandex Metrika API error:', errorData)
      throw new Error(`Yandex Metrika API error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('Success, got data:', data)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching Yandex Metrika stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check your Yandex Metrika token and counter ID'
      },
      { status: 500 }
    )
  }
}
