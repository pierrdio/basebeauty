import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Проверяем, что счетчик доступен
    const response = await fetch(`https://api-metrika.yandex.net/management/v1/counter/105967815`)
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Counter not accessible',
        status: response.status,
        statusText: response.statusText
      })
    }
    
    const counterData = await response.json()
    
    return NextResponse.json({
      success: true,
      counter: {
        id: counterData.id,
        name: counterData.name,
        status: counterData.status,
        site: counterData.site
      },
      message: 'Counter is accessible'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check counter',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
