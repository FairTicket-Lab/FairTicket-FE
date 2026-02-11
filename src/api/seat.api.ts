import type { SeatSection, SeatHoldResponse, VenueSectionInfo } from '@/types/seat'
import client from './client'
import { getMockSeatSections, getMockVenueSections, getMockSectionSeats } from './mock/seats.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const seatApi = {
  async getVenueSections(_concertId: string, _dateId: string): Promise<VenueSectionInfo[]> {
    if (USE_MOCK) return getMockVenueSections()
    return (await client.get<VenueSectionInfo[]>(`/seats/${_concertId}/${_dateId}/sections`)).data
  },

  async getSectionSeats(
    _concertId: string,
    _dateId: string,
    sectionId: string,
  ): Promise<SeatSection[]> {
    if (USE_MOCK) return getMockSectionSeats(sectionId)
    return (
      await client.get<SeatSection[]>(`/seats/${_concertId}/${_dateId}/${sectionId}`)
    ).data
  },

  async getSeatMap(_concertId: string, _dateId: string): Promise<SeatSection[]> {
    if (USE_MOCK) return getMockSeatSections()
    return (await client.get<SeatSection[]>(`/seats/${_concertId}/${_dateId}`)).data
  },

  async holdSeat(
    concertId: string,
    dateId: string,
    seatId: string,
    token: string,
  ): Promise<SeatHoldResponse> {
    if (USE_MOCK) {
      return {
        holdId: `hold-${Date.now()}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        seatId,
      }
    }
    return (
      await client.post<SeatHoldResponse>('/seats/hold', { concertId, dateId, seatId, token })
    ).data
  },
}
