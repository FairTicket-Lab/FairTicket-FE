import type { Concert } from '@/types/concert'
import client from './client'
import { mockConcerts } from './mock/concerts.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const concertApi = {
  async getAll(): Promise<Concert[]> {
    if (USE_MOCK) return mockConcerts
    return (await client.get<Concert[]>('/concerts')).data
  },

  async getById(id: string): Promise<Concert | undefined> {
    if (USE_MOCK) return mockConcerts.find((c) => c.id === id)
    return (await client.get<Concert>(`/concerts/${id}`)).data
  },
}
