import type { Concert } from '@/types/concert'
import client from './client'
import { mockConcerts } from './mock/concerts.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 공연 ID → 정적 이미지 매핑 */
const CONCERT_IMAGES: Record<string, string> = {
  '1': '/images/iu.jpg',
  '2': '/images/blackpink.jpg',
  '3': '/images/bts.jpg',
  '4': '/images/Lucy.jpg',
  '5': '/images/aespa.jpg',
  '6': '/images/seventeen.png',
}
const DEFAULT_IMAGE = '/images/iu.jpg'

function attachImage(data: Omit<Concert, 'image'> & { id: string }): Concert {
  return { ...data, image: CONCERT_IMAGES[data.id] ?? DEFAULT_IMAGE }
}

export const concertApi = {
  async getAll(): Promise<Concert[]> {
    if (USE_MOCK) return mockConcerts
    try {
      const { data } = await client.get<Omit<Concert, 'image'>[]>('/v1/concerts')
      return data.map((c) => attachImage({ ...c, id: String(c.id) }))
    } catch {
      return mockConcerts
    }
  },

  async getById(id: string): Promise<Concert | undefined> {
    if (USE_MOCK) return mockConcerts.find((c) => c.id === id)
    try {
      const { data } = await client.get<Omit<Concert, 'image'>>(`/v1/concerts/${id}`)
      if (!data) return undefined
      return attachImage({ ...data, id: String(data.id) })
    } catch {
      return mockConcerts.find((c) => c.id === id)
    }
  },
}
