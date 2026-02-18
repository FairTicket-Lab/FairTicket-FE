import type { Concert } from '@/types/concert'

/**
 * init.sql 시드 데이터 기반 mock (2026-02-18 동기화)
 *
 * concerts 6개 / schedules 7개 / grades VIP·S·A
 * 이미지: concert.api.ts CONCERT_IMAGES 매핑과 동일
 */
export const mockConcerts: Concert[] = [
  {
    id: '1',
    title: '2026 아이유 콘서트 : The Golden Hour',
    artist: '아이유',
    venue: '잠실종합운동장',
    image: '/images/iu.jpg',
    saleStatus: 'on-sale',
    dates: [
      { id: '1', date: '2026-03-15', time: '19:00', venue: '잠실종합운동장', available: true, activeTrack: 'lottery' },
      { id: '7', date: '2026-01-10', time: '19:00', venue: '잠실종합운동장', available: false },
    ],
    grades: [
      { id: '1', label: 'VIP', price: 154000, totalSeats: 2700, availableSeats: 2380 },
      { id: '2', label: 'S', price: 121000, totalSeats: 1800, availableSeats: 1520 },
      { id: '3', label: 'A', price: 88000, totalSeats: 600, availableSeats: 485 },
    ],
  },
  {
    id: '2',
    title: '2026 BLACKPINK WORLD TOUR',
    artist: 'BLACKPINK',
    venue: '올림픽공원 체조경기장',
    image: '/images/blackpink.jpg',
    saleStatus: 'on-sale',
    dates: [
      { id: '2', date: '2026-04-20', time: '18:00', venue: '올림픽공원 체조경기장', available: true, activeTrack: 'live' },
    ],
    grades: [
      { id: '4', label: 'VIP', price: 176000, totalSeats: 2700, availableSeats: 2450 },
      { id: '5', label: 'S', price: 143000, totalSeats: 1800, availableSeats: 1680 },
      { id: '6', label: 'A', price: 110000, totalSeats: 600, availableSeats: 540 },
    ],
  },
  {
    id: '3',
    title: '2026 BTS YET TO COME',
    artist: 'BTS',
    venue: '고척스카이돔',
    image: '/images/bts.jpg',
    saleStatus: 'coming-soon',
    saleDate: '2026-03-01T20:00:00',
    dates: [
      { id: '3', date: '2026-05-10', time: '19:00', venue: '고척스카이돔', available: false },
    ],
    grades: [
      { id: '7', label: 'VIP', price: 165000, totalSeats: 2700, availableSeats: 2700 },
      { id: '8', label: 'S', price: 132000, totalSeats: 1800, availableSeats: 1800 },
      { id: '9', label: 'A', price: 99000, totalSeats: 600, availableSeats: 600 },
    ],
  },
  {
    id: '4',
    title: 'LUCY LIVE IN SEOUL',
    artist: 'LUCY',
    venue: '올림픽홀',
    image: '/images/Lucy.jpg',
    saleStatus: 'on-sale',
    dates: [
      { id: '4', date: '2026-03-22', time: '19:00', venue: '올림픽홀', available: true, activeTrack: 'lottery' },
    ],
    grades: [
      { id: '10', label: 'VIP', price: 132000, totalSeats: 1200, availableSeats: 1050 },
      { id: '11', label: 'S', price: 99000, totalSeats: 800, availableSeats: 720 },
      { id: '12', label: 'A', price: 66000, totalSeats: 400, availableSeats: 360 },
    ],
  },
  {
    id: '5',
    title: '2026 aespa SYNK : PARALLEL LINE',
    artist: 'aespa',
    venue: 'KSPO DOME',
    image: '/images/aespa.jpg',
    saleStatus: 'on-sale',
    dates: [
      { id: '5', date: '2026-04-05', time: '18:00', venue: 'KSPO DOME', available: true, activeTrack: 'live' },
    ],
    grades: [
      { id: '13', label: 'VIP', price: 143000, totalSeats: 2700, availableSeats: 2310 },
      { id: '14', label: 'S', price: 110000, totalSeats: 1800, availableSeats: 1590 },
      { id: '15', label: 'A', price: 77000, totalSeats: 600, availableSeats: 520 },
    ],
  },
  {
    id: '6',
    title: 'SEVENTEEN WORLD TOUR BE THE SUN',
    artist: 'SEVENTEEN',
    venue: '잠실실내체육관',
    image: '/images/seventeen.png',
    saleStatus: 'coming-soon',
    saleDate: '2026-03-15T20:00:00',
    dates: [
      { id: '6', date: '2026-05-20', time: '18:00', venue: '잠실실내체육관', available: false },
    ],
    grades: [
      { id: '16', label: 'VIP', price: 154000, totalSeats: 2700, availableSeats: 2700 },
      { id: '17', label: 'S', price: 121000, totalSeats: 1800, availableSeats: 1800 },
      { id: '18', label: 'A', price: 88000, totalSeats: 600, availableSeats: 600 },
    ],
  },
]
