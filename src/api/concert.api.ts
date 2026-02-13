import type { Concert } from '@/types/concert'
import client from './client'
import { mockConcerts } from './mock/concerts.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 공연 ID → 정적 이미지 매핑 */
const CONCERT_IMAGES: Record<string, string> = {
  '1': '/images/event-1.jpg',
  '2': '/images/event-2.jpg',
}
const DEFAULT_IMAGE = '/images/event-1.jpg'

function attachImage(data: Omit<Concert, 'image'> & { id: string }): Concert {
  return { ...data, image: CONCERT_IMAGES[data.id] ?? DEFAULT_IMAGE }
}

export const concertApi = {
  async getAll(): Promise<Concert[]> {
    if (USE_MOCK) return mockConcerts
    const { data } = await client.get<Omit<Concert, 'image'>[]>('/v1/concerts')
    return data.map((c) => attachImage({ ...c, id: String(c.id) }))
  },

  async getById(id: string): Promise<Concert | undefined> {
    if (USE_MOCK) return mockConcerts.find((c) => c.id === id)
    const { data } = await client.get<Omit<Concert, 'image'>>(`/v1/concerts/${id}`)
    if (!data) return undefined
    return attachImage({ ...data, id: String(data.id) })
  },
}
