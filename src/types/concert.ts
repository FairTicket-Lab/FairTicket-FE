export type SaleStatus = 'on-sale' | 'coming-soon' | 'sold-out'

export interface TicketGrade {
  id: string
  label: string // VIP, R, S, A
  price: number
  originalPrice?: number
  totalSeats: number
  availableSeats: number
}

export interface ConcertDate {
  id: string
  date: string // ISO 날짜
  time: string
  venue: string
  city: string
  available: boolean
}

export interface Concert {
  id: string
  title: string
  artist: string
  subtitle: string
  image: string
  category: string
  description: string
  tags: string[]
  saleStatus: SaleStatus
  saleDate?: string
  dates: ConcertDate[]
  grades: TicketGrade[]
}
