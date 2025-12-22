"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Eye, Clock, MousePointer, TrendingDown } from "lucide-react"

interface MetrikaData {
  data: Array<{
    dimensions: Array<{ name: string }>
    metrics: number[]
  }>
}

interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
}

const MetrikaStats = () => {
  const [data, setData] = useState<MetrikaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("7daysAgo")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/yandex-metrika/stats?startDate=${period}&endDate=today`)
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching metrika stats:', error)
      setError('Не удалось загрузить статистику')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | string) => {
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds
    if (isNaN(numSeconds)) return '0:00'
    
    const minutes = Math.floor(numSeconds / 60)
    const remainingSeconds = Math.floor(numSeconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatCards = (): StatCard[] => {
    if (!data || !data.data || !data.data[0]) return []

    const metrics = data.data[0].metrics
    
    // Убираем рандомные изменения, показываем реальные данные
    return [
      {
        title: "Визиты",
        value: metrics[0]?.toLocaleString() || 0,
        icon: <Eye className="h-4 w-4" />,
        description: "Общее количество посещений"
      },
      {
        title: "Посетители",
        value: metrics[1]?.toLocaleString() || 0,
        icon: <Users className="h-4 w-4" />,
        description: "Уникальные посетители"
      },
      {
        title: "Просмотры",
        value: metrics[2]?.toLocaleString() || 0,
        icon: <MousePointer className="h-4 w-4" />,
        description: "Просмотры страниц"
      },
      {
        title: "Отказы",
        value: `${typeof metrics[3] === 'number' ? metrics[3].toFixed(1) : '0'}%`,
        icon: <TrendingDown className="h-4 w-4" />,
        description: "Процент отказов"
      },
      {
        title: "Время на сайте",
        value: formatDuration(typeof metrics[4] === 'number' ? metrics[4] : parseFloat(metrics[4] || '0')),
        icon: <Clock className="h-4 w-4" />,
        description: "Среднее время посещения"
      }
    ]
  }

  if (loading) {
    return (
      <div className="p-5 rounded-3xl border border-dashed">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Статистика Яндекс.Метрики</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 rounded-3xl border border-dashed">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Статистика Яндекс.Метрики</h3>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-2 text-blue-600 hover:underline"
            >
              Попробовать снова
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = getStatCards()

  return (
    <div className="p-5 rounded-3xl border border-dashed">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Статистика Яндекс.Метрики</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Сегодня</SelectItem>
            <SelectItem value="yesterday">Вчера</SelectItem>
            <SelectItem value="7daysAgo">7 дней</SelectItem>
            <SelectItem value="30daysAgo">30 дней</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {card.icon}
                <h4 className="text-sm font-medium text-gray-600">{card.title}</h4>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Данные обновлены: {new Date().toLocaleString('ru-RU')}
      </div>
    </div>
  )
}

export default MetrikaStats
