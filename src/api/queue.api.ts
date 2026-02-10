import type { QueueEntry, QueuePollResponse } from '@/types/queue'
import client from './client'
import { createMockQueueEntry, pollMockQueue } from './mock/queue.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const queueApi = {
  async join(concertId: string): Promise<QueueEntry> {
    if (USE_MOCK) return createMockQueueEntry(concertId)
    return (await client.post<QueueEntry>('/queue/join', { concertId })).data
  },

  async poll(queueId: string): Promise<QueuePollResponse> {
    if (USE_MOCK) return pollMockQueue()
    return (await client.get<QueuePollResponse>(`/queue/${queueId}/poll`)).data
  },

  async heartbeat(queueId: string): Promise<void> {
    if (USE_MOCK) return
    await client.post(`/queue/${queueId}/heartbeat`)
  },

  async cancel(queueId: string): Promise<void> {
    if (USE_MOCK) return
    await client.post(`/queue/${queueId}/cancel`)
  },
}
