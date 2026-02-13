import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const adminApi = {
  /** 좌석 풀 초기화 (관리자용) */
  async initializeSeatPools(scheduleId: string): Promise<void> {
    if (USE_MOCK) return
    await client.post(`/v1/admin/seats/${scheduleId}/initialize`)
  },
}
