import type { Reservation, ReservationSeatItem, TrackType } from '@/types/reservation'
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface LotteryResultResponse {
  id: number
  scheduleId: number
  grade: string
  quantity: number
  status: string
  resultType: 'PAYMENT_PENDING' | 'WON' | 'ASSIGNED' | 'LOST'
  message: string
  paymentDeadline: string
  seats: { zone: string; seatNumber: string }[]
}

export interface CancellationWindowResponse {
  allowed: boolean
  windowStart: string
  windowEnd: string
  message: string
}

let mockTickets: Reservation[] = []

export const reservationApi = {
  /** 라이브 트랙 예약 (mock 전용 — 실제 연동은 seatApi.selectSeat 사용) */
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
    seats?: ReservationSeatItem[]
  }): Promise<Reservation> {
    if (USE_MOCK) {
      const timeoutMinutes = params.track === 'lottery' ? 5 : 10
      const totalPrice = params.seats
        ? params.seats.reduce((sum, s) => sum + s.unitPrice, 0)
        : params.unitPrice * params.quantity
      const reservation: Reservation = {
        id: `rsv-${Date.now()}`,
        concertId: params.concertId,
        concertTitle: params.concertTitle,
        dateId: params.dateId,
        track: params.track,
        gradeId: params.gradeId,
        gradeLabel: params.gradeLabel,
        seatId: params.seatId,
        seats: params.seats,
        quantity: params.quantity,
        unitPrice: params.unitPrice,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString(),
      }
      mockTickets.push(reservation)
      return reservation
    }
    // 실제 BE에는 통합 POST /reservations 없음
    // 라이브: seatApi.selectSeat → paymentApi.prepare
    // 로터리: reservationApi.createLottery
    throw new Error('Live track은 seatApi.selectSeat을 사용하세요')
  },

  /** 로터리 트랙 예약 */
  async createLottery(params: {
    scheduleId: string
    grade: string
    quantity: number
    token: string
    concertTitle: string
    gradeId: string
    gradeLabel: string
    unitPrice: number
  }): Promise<Reservation> {
    if (USE_MOCK) {
      const reservation: Reservation = {
        id: `rsv-${Date.now()}`,
        concertId: params.scheduleId,
        concertTitle: params.concertTitle,
        dateId: params.scheduleId,
        track: 'lottery',
        gradeId: params.gradeId,
        gradeLabel: params.gradeLabel,
        quantity: params.quantity,
        unitPrice: params.unitPrice,
        totalPrice: params.unitPrice * params.quantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      }
      mockTickets.push(reservation)
      return reservation
    }
    const { data } = await client.post(
      `/v1/lottery/${params.scheduleId}`,
      { scheduleId: params.scheduleId, grade: params.grade, quantity: params.quantity },
      { headers: { 'X-Queue-Token': params.token } },
    )
    return {
      id: String(data.id),
      concertId: params.scheduleId,
      concertTitle: params.concertTitle,
      dateId: params.scheduleId,
      track: 'lottery',
      gradeId: params.gradeId,
      gradeLabel: params.gradeLabel,
      quantity: params.quantity,
      unitPrice: params.unitPrice,
      totalPrice: params.unitPrice * params.quantity,
      status: data.status?.toLowerCase() ?? 'pending',
      createdAt: data.createdAt ?? new Date().toISOString(),
      expiresAt: data.paymentDeadline ?? new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    }
  },

  /** 로터리 예약 결과 조회 */
  async getById(id: string): Promise<Reservation | undefined> {
    if (USE_MOCK) return mockTickets.find((r) => r.id === id)
    const { data } = await client.get(`/v1/lottery/reservations/${id}`)
    if (!data) return undefined
    return {
      id: String(data.id),
      concertId: String(data.scheduleId),
      concertTitle: '',
      dateId: String(data.scheduleId),
      track: 'lottery',
      gradeId: data.grade?.toLowerCase() ?? '',
      gradeLabel: data.grade ?? '',
      quantity: data.quantity ?? 1,
      unitPrice: 0,
      totalPrice: 0,
      status: data.status?.toLowerCase() ?? 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: data.paymentDeadline ?? new Date().toISOString(),
    }
  },

  /** 내 예약 목록 (결제 + 예약 조합) */
  async getMyTickets(): Promise<Reservation[]> {
    if (USE_MOCK) return [...mockTickets].reverse()
    const [{ data: payments }, { data: reservations }] = await Promise.all([
      client.get('/v1/payment/my'),
      client.get('/v1/reservations/my'),
    ])
    // reservationId → trackType 매핑
    const trackMap = new Map<string, string>()
    const gradeMap = new Map<string, string>()
    const qtyMap = new Map<string, number>()
    if (Array.isArray(reservations)) {
      for (const r of reservations) {
        trackMap.set(String(r.id), (r.trackType ?? 'LOTTERY').toLowerCase())
        gradeMap.set(String(r.id), r.grade ?? '')
        qtyMap.set(String(r.id), r.quantity ?? 1)
      }
    }
    if (!Array.isArray(payments)) return []
    return payments.map((p: any) => {
      const resId = String(p.reservationId)
      return {
        id: resId,
        concertId: '',
        concertTitle: '',
        dateId: '',
        track: (trackMap.get(resId) ?? 'lottery') as TrackType,
        gradeId: '',
        gradeLabel: gradeMap.get(resId) ?? '',
        quantity: qtyMap.get(resId) ?? 1,
        unitPrice: p.amount ?? 0,
        totalPrice: p.amount ?? 0,
        status: (p.status === 'COMPLETED' ? 'paid' : 'pending') as Reservation['status'],
        createdAt: p.createdAt ?? new Date().toISOString(),
        expiresAt: p.expiresAt ?? new Date().toISOString(),
      }
    })
  },

  /** 내 로터리 예약 결과 목록 (스케줄별) */
  async getLotteryResults(scheduleId: string): Promise<LotteryResultResponse[]> {
    if (USE_MOCK) {
      return mockTickets
        .filter((t) => t.track === 'lottery' && t.dateId === scheduleId)
        .map((t) => ({
          id: Number(t.id.replace('rsv-', '')),
          scheduleId: Number(scheduleId),
          grade: t.gradeLabel,
          quantity: t.quantity,
          status: t.status.toUpperCase(),
          resultType: 'PAYMENT_PENDING' as const,
          message: '결제 대기 중',
          paymentDeadline: t.expiresAt,
          seats: [],
        }))
    }
    return (
      await client.get<LotteryResultResponse[]>('/v1/lottery/reservations', {
        params: { scheduleId },
      })
    ).data
  },

  /** 취소 가능 기간 조회 */
  async getCancellationWindow(scheduleId: string): Promise<CancellationWindowResponse> {
    if (USE_MOCK) {
      return {
        allowed: true,
        windowStart: new Date().toISOString(),
        windowEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        message: '취소 가능',
      }
    }
    return (
      await client.get<CancellationWindowResponse>(
        `/v1/reservations/schedules/${scheduleId}/cancellation-window`,
      )
    ).data
  },

  /** 예약 취소 */
  async cancel(reservationId: string): Promise<void> {
    if (USE_MOCK) {
      mockTickets = mockTickets.filter((t) => t.id !== reservationId)
      return
    }
    await client.delete(`/v1/reservations/${reservationId}`)
  },

  /** 결제 (mock 전용 — 실제 연동은 paymentApi.prepare 사용) */
  async pay(reservationId: string): Promise<Reservation> {
    if (USE_MOCK) {
      const r = mockTickets.find((t) => t.id === reservationId)
      if (r) r.status = 'paid'
      return r!
    }
    // 실제 BE: POST /v1/payment/prepare → PortOne → webhook
    throw new Error('실제 결제는 paymentApi.prepare를 사용하세요')
  },
}
