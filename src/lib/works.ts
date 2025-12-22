// This file can be used to fetch works from your database
// For the dynamic sitemap generation

export interface Work {
  id: number
  title: string
  photos: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export async function getWorks(): Promise<Work[]> {
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

export async function getWorkById(id: string): Promise<Work | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/works/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch work')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching work for sitemap:', error)
    return null
  }
}
