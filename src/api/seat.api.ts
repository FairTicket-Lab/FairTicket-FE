import type { SeatSection, SeatHoldResponse } from '@/types/seat'
import client from './client'
import { getMockSeatSections } from './mock/seats.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const seatApi = {
  async getSeatMap(_concertId: string, _dateId: string): Promise<SeatSection[]> {
    if (USE_MOCK) return getMockSeatSections()
    return (await client.get<SeatSection[]>(`/seats/${_concertId}/${_dateId}`)).data
  },

  async holdSeat(concertId: string, dateId: string, seatId: string, token: string): Promise<SeatHoldResponse> {
    if (USE_MOCK) {
      return {
        holdId: `hold-${Date.now()}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        seatId,
      }
    }
    return (await client.post<SeatHoldResponse>('/seats/hold', { concertId, dateId, seatId, token })).data
  },
}
