import type {
  QueueEntry,
  QueuePollResponse,
  QueueEntryApiResponse,
  QueueStatusApiResponse,
} from '@/types/queue'
import client from './client'
import { createMockQueueEntry, pollMockQueue } from './mock/queue.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const queueApi = {
  async join(scheduleId: string): Promise<QueueEntry> {
    if (USE_MOCK) return createMockQueueEntry(scheduleId)
    const raw = (await client.post<QueueEntryApiResponse>(`/v1/queue/${scheduleId}/enter`)).data
    return {
      queueId: String(raw.scheduleId),
      concertId: String(raw.scheduleId),
      position: raw.position,
      totalAhead: raw.position,
      estimatedWaitSeconds: raw.estimatedWaitMinutes * 60,
      status: 'waiting',
    }
  },

  async poll(scheduleId: string): Promise<QueuePollResponse> {
    if (USE_MOCK) return pollMockQueue()
    const raw = (await client.get<QueueStatusApiResponse>(`/v1/queue/${scheduleId}/status`)).data
    return {
      position: raw.position,
      totalAhead: raw.aheadCount,
      estimatedWaitSeconds: raw.estimatedWaitMinutes * 60,
      status: raw.status === 'READY' ? 'ready' : 'waiting',
      token: raw.token ?? undefined,
    }
  },

  async heartbeat(scheduleId: string): Promise<void> {
    if (USE_MOCK) return
    await client.post(`/v1/queue/${scheduleId}/heartbeat`)
  },

  async cancel(scheduleId: string): Promise<void> {
    if (USE_MOCK) return
    await client.delete(`/v1/queue/${scheduleId}/leave`)
  },
}
