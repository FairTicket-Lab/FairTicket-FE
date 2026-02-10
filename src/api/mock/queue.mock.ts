import type { QueueEntry, QueuePollResponse } from '@/types/queue'

let mockPosition = 247

export function createMockQueueEntry(concertId: string): QueueEntry {
  mockPosition = Math.floor(Math.random() * 300) + 50
  return {
    queueId: `q-${Date.now()}`,
    concertId,
    position: mockPosition,
    totalAhead: mockPosition,
    estimatedWaitSeconds: mockPosition * 3,
    status: 'waiting',
  }
}

export function pollMockQueue(): QueuePollResponse {
  // 매 폴링마다 3~8명씩 줄어듬
  mockPosition = Math.max(0, mockPosition - Math.floor(Math.random() * 6 + 3))

  if (mockPosition <= 0) {
    return {
      position: 0,
      totalAhead: 0,
      estimatedWaitSeconds: 0,
      status: 'ready',
      token: `tk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }
  }

  return {
    position: mockPosition,
    totalAhead: mockPosition,
    estimatedWaitSeconds: mockPosition * 3,
    status: 'waiting',
  }
}
