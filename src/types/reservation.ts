export type ReservationStatus = 'pending' | 'paid' | 'cancelled' | 'expired'
export type TrackType = 'lottery' | 'live'

export interface ReservationSeatItem {
  seatId: string
  section: string
  row: string
  number: number
  gradeId: string
  gradeLabel: string
  unitPrice: number
}

export interface Reservation {
  id: string
  concertId: string
  concertTitle: string
  dateId: string
  track: TrackType
  gradeId: string
  gradeLabel: string
  seatId?: string // 라이브 트랙 단일 좌석 (하위 호환)
  seats?: ReservationSeatItem[] // 라이브 트랙 복수 좌석
  quantity: number // 로터리 트랙은 1~2, 라이브는 1~4
  unitPrice: number
  totalPrice: number
  status: ReservationStatus
  createdAt: string
  expiresAt: string // 결제 기한
}
