export type QueueStatus = 'waiting' | 'ready' | 'expired' | 'cancelled'

export interface QueueEntry {
  queueId: string
  concertId: string
  position: number
  totalAhead: number
  estimatedWaitSeconds: number
  status: QueueStatus
  token?: string // 순번 도달 시 발급되는 진입 토큰
}

export interface QueueJoinRequest {
  concertId: string
}

export interface QueuePollResponse {
  position: number
  totalAhead: number
  estimatedWaitSeconds: number
  status: QueueStatus
  token?: string
}
