import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface PaymentInitResponse {
  merchantUid: string
  amount: number
  itemName: string
  paymentId: number
  timeoutSeconds: number
}

export interface PaymentTimerResponse {
  reservationId: number
  remainingSeconds: number
  expired: boolean
}

export interface PaymentInfo {
  id: number
  reservationId: number
  merchantUid: string
  impUid: string | null
  pgTid: string | null
  amount: number
  method: string | null
  status: string
  expiresAt: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export const paymentApi = {
  /** 결제 준비 (5분 타이머 시작) */
  async prepare(reservationId: string): Promise<PaymentInitResponse> {
    if (USE_MOCK) {
      return {
        merchantUid: `ft-${Date.now()}`,
        amount: 120000,
        itemName: 'FairTicket 예매',
        paymentId: Date.now(),
        timeoutSeconds: 300,
      }
    }
    return (
      await client.post<PaymentInitResponse>('/v1/payment/prepare', null, {
        params: { reservationId },
      })
    ).data
  },

  /** 결제 남은 시간 조회 */
  async getTimer(reservationId: string): Promise<PaymentTimerResponse> {
    if (USE_MOCK) {
      return { reservationId: Number(reservationId), remainingSeconds: 280, expired: false }
    }
    return (await client.get<PaymentTimerResponse>(`/v1/payment/${reservationId}/timer`)).data
  },

  /** 예약 ID로 결제 정보 조회 */
  async getByReservation(reservationId: string): Promise<PaymentInfo | null> {
    if (USE_MOCK) return null
    return (await client.get<PaymentInfo>(`/v1/payment/reservation/${reservationId}`)).data
  },

  /** 내 결제 목록 */
  async getMyPayments(): Promise<PaymentInfo[]> {
    if (USE_MOCK) return []
    return (await client.get<PaymentInfo[]>('/v1/payment/my')).data
  },

  /** 결제 단건 조회 */
  async getById(paymentId: string): Promise<PaymentInfo> {
    if (USE_MOCK) {
      return {
        id: Number(paymentId),
        reservationId: 0,
        merchantUid: '',
        impUid: null,
        pgTid: null,
        amount: 0,
        method: null,
        status: 'PENDING',
        expiresAt: null,
        paidAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return (await client.get<PaymentInfo>(`/v1/payment/${paymentId}`)).data
  },

  /** PortOne 결제 완료 후 서버 검증 (webhook) */
  async webhook(params: { impUid: string; merchantUid: string }): Promise<void> {
    if (USE_MOCK) return
    await client.post('/v1/payment/webhook', {
      imp_uid: params.impUid,
      merchant_uid: params.merchantUid,
    })
  },

  /** 환불 */
  async refund(paymentId: string, reason: string = '사용자 요청'): Promise<void> {
    if (USE_MOCK) return
    await client.post(`/v1/payment/${paymentId}/refund`, null, { params: { reason } })
  },
}
