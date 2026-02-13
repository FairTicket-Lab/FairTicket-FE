import type { Concert } from '@/types/concert'

/**
 * init.sql 시드 데이터 기반 mock
 *
 * concerts: 아이유(1), 블랙핑크(2)
 * schedules: 아이유 1회차(1, OPEN), 블랙핑크(2, UPCOMING), 아이유 2회차(3, CLOSED)
 * grades: VIP / S / A (schedule별)
 * zones: FLOOR A-H(VIP), 1F 3-13(VIP), 1F 1,2,14,15(S), 2F 27-40(S), 2F 24-26,41-43(A)
 */
export const mockConcerts: Concert[] = [
  {
    id: '1',
    title: '2026 아이유 콘서트',
    artist: '아이유',
    venue: '잠실종합운동장',
    image: '/images/event-1.jpg',
    saleStatus: 'on-sale',
    dates: [
      { id: '1', date: '2026-03-15', time: '19:00', venue: '잠실종합운동장', available: true },
      { id: '3', date: '2026-01-10', time: '19:00', venue: '잠실종합운동장', available: false },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 120000, totalSeats: 2700, availableSeats: 820 },
      { id: 's', label: 'S', price: 90000, totalSeats: 1800, availableSeats: 1240 },
      { id: 'a', label: 'A', price: 60000, totalSeats: 600, availableSeats: 485 },
    ],
  },
  {
    id: '2',
    title: '2026 블랙핑크 월드투어',
    artist: 'BLACKPINK',
    venue: '올림픽공원 체조경기장',
    image: '/images/event-2.jpg',
    saleStatus: 'coming-soon',
    saleDate: '2026-02-20T20:00:00',
    dates: [
      { id: '2', date: '2026-04-20', time: '18:00', venue: '올림픽공원 체조경기장', available: false },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 150000, totalSeats: 2700, availableSeats: 2700 },
      { id: 's', label: 'S', price: 100000, totalSeats: 1800, availableSeats: 1800 },
      { id: 'a', label: 'A', price: 70000, totalSeats: 600, availableSeats: 600 },
    ],
  },
]
