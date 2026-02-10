import type { Reservation, TrackType } from '@/types/reservation'
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

let mockTickets: Reservation[] = []

export const reservationApi = {
  async create(params: {
    concertId: string
    concertTitle: string
    dateId: string
    track: TrackType
    gradeId: string
    gradeLabel: string
    unitPrice: number
    quantity: number
    seatId?: string
  }): Promise<Reservation> {
    if (USE_MOCK) {
      const timeoutMinutes = params.track === 'cart' ? 5 : 10
      const reservation: Reservation = {
        id: `rsv-${Date.now()}`,
        concertId: params.concertId,
        concertTitle: params.concertTitle,
        dateId: params.dateId,
        track: params.track,
        gradeId: params.gradeId,
        gradeLabel: params.gradeLabel,
        seatId: params.seatId,
        quantity: params.quantity,
        unitPrice: params.unitPrice,
        totalPrice: params.unitPrice * params.quantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString(),
      }
      mockTickets.push(reservation)
      return reservation
    }
    return (await client.post<Reservation>('/reservations', params)).data
  },

  async getById(id: string): Promise<Reservation | undefined> {
    if (USE_MOCK) return mockTickets.find((r) => r.id === id)
    return (await client.get<Reservation>(`/reservations/${id}`)).data
  },

  async getMyTickets(): Promise<Reservation[]> {
    if (USE_MOCK) return [...mockTickets].reverse()
    return (await client.get<Reservation[]>('/reservations/my')).data
  },

  async pay(reservationId: string): Promise<Reservation> {
    if (USE_MOCK) {
      const r = mockTickets.find((t) => t.id === reservationId)
      if (r) r.status = 'paid'
      return r!
    }
    return (await client.post<Reservation>(`/reservations/${reservationId}/pay`)).data
  },
}
