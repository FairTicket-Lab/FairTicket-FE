export type SeatStatus = 'available' | 'held' | 'sold'

export interface Seat {
  id: string
  section: string
  row: string
  number: number
  gradeId: string
  status: SeatStatus
  x: number // SVG 좌표
  y: number
}

export interface SeatMap {
  concertId: string
  dateId: string
  sections: SeatSection[]
}

export interface SeatSection {
  id: string
  label: string
  seats: Seat[]
}

export interface SeatHoldRequest {
  concertId: string
  dateId: string
  seatId: string
  token: string // 대기열 진입 토큰
}

export interface SeatHoldResponse {
  holdId: string
  expiresAt: string // ISO timestamp — 10분 후
  seatId: string
}

export interface VenueSectionInfo {
  id: string
  label: string
  grade: string // 'vip' | 's' | 'a'
  totalSeats: number
  availableSeats: number
}
