import { MetadataRoute } from 'next'

interface Work {
  id: number
  title: string
  photos: string
  description?: string
  createdAt: string | Date
  updatedAt: string | Date
}

async function getWorks(): Promise<Work[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/works`)
    if (!response.ok) {
      throw new Error('Failed to fetch works')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching works for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://basebeauty.ru'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/works`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Dynamic work pages from database
  try {
    const works = await getWorks()
    const workPages = works.map((work: Work) => ({
      url: `${baseUrl}/works/${work.id}`,
      lastModified: work.updatedAt ? new Date(work.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...workPages]
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
    return staticPages
  }
}
