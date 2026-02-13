import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface GradeResponse {
  grade: string // "VIP", "S", "A"
  price: number
}

export const scheduleApi = {
  /** 회차별 등급 목록 */
  async getGrades(scheduleId: string): Promise<GradeResponse[]> {
    if (USE_MOCK) {
      return [
        { grade: 'VIP', price: 120000 },
        { grade: 'S', price: 90000 },
        { grade: 'A', price: 60000 },
      ]
    }
    return (await client.get<GradeResponse[]>(`/v1/schedules/${scheduleId}/grades`)).data
  },

  /** 등급별 구역 목록 */
  async getZonesByGrade(scheduleId: string, grade: string): Promise<string[]> {
    if (USE_MOCK) {
      const mockZones: Record<string, string[]> = {
        VIP: ['FLOOR A', 'FLOOR B', 'FLOOR C', 'FLOOR D', 'FLOOR E', 'FLOOR F', 'FLOOR G', 'FLOOR H', '1F 3', '1F 4', '1F 5', '1F 6', '1F 7', '1F 8', '1F 9', '1F 10', '1F 11', '1F 12', '1F 13'],
        S: ['1F 1', '1F 2', '1F 14', '1F 15', '2F 27', '2F 28', '2F 29', '2F 30', '2F 31', '2F 32', '2F 33', '2F 34', '2F 35', '2F 36', '2F 37', '2F 38', '2F 39', '2F 40'],
        A: ['2F 24', '2F 25', '2F 26', '2F 41', '2F 42', '2F 43'],
      }
      return mockZones[grade] ?? []
    }
    return (await client.get<string[]>(`/v1/schedules/${scheduleId}/grades/${grade}/zones`)).data
  },
}
