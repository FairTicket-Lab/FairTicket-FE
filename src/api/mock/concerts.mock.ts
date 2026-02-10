import type { Concert } from '@/types/concert'

export const mockConcerts: Concert[] = [
  {
    id: 'aurora-world-tour',
    title: 'AURORA WORLD TOUR 2026',
    artist: 'AURORA',
    subtitle: 'The Ethereal Experience',
    image: '/images/event-1.jpg',
    category: 'Concert',
    description:
      'Experience the magic of AURORA\'s world tour, featuring breathtaking performances with stunning visual production across 40 cities worldwide.',
    tags: ['World Tour', 'Concert', 'Live'],
    saleStatus: 'on-sale',
    dates: [
      { id: 'd1', date: '2026-04-15', time: '19:00', venue: 'Madison Square Garden', city: 'New York', available: true },
      { id: 'd2', date: '2026-04-18', time: '19:00', venue: 'United Center', city: 'Chicago', available: true },
      { id: 'd3', date: '2026-04-22', time: '19:00', venue: 'The Forum', city: 'Los Angeles', available: false },
      { id: 'd4', date: '2026-05-10', time: '19:00', venue: 'O2 Arena', city: 'London', available: true },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 450, originalPrice: 550, totalSeats: 200, availableSeats: 23 },
      { id: 'r', label: 'R', price: 250, totalSeats: 500, availableSeats: 156 },
      { id: 's', label: 'S', price: 120, totalSeats: 2000, availableSeats: 834 },
      { id: 'a', label: 'A', price: 25, totalSeats: 10000, availableSeats: 9999 },
    ],
  },
  {
    id: 'nova-fanmeeting',
    title: 'NOVA 1ST FAN MEETING',
    artist: 'NOVA',
    subtitle: 'Hello, Universe!',
    image: '/images/event-2.jpg',
    category: 'Fan Meeting',
    description:
      'NOVA\'s very first fan meeting! An intimate event with games, performances, and special fan interactions.',
    tags: ['Fan Meeting', 'Exclusive', 'Interactive'],
    saleStatus: 'on-sale',
    dates: [
      { id: 'd1', date: '2026-05-20', time: '14:00', venue: 'KINTEX Hall', city: 'Seoul', available: true },
      { id: 'd2', date: '2026-05-21', time: '14:00', venue: 'KINTEX Hall', city: 'Seoul', available: true },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 320, totalSeats: 100, availableSeats: 50 },
      { id: 'r', label: 'R', price: 85, totalSeats: 3000, availableSeats: 2400 },
    ],
  },
  {
    id: 'eclipse-comeback',
    title: 'ECLIPSE COMEBACK SHOWCASE',
    artist: 'ECLIPSE',
    subtitle: 'Chapter: Rebirth',
    image: '/images/event-3.jpg',
    category: 'Showcase',
    description:
      'ECLIPSE returns with their highly anticipated new album. Be the first to hear the new tracks live in this special comeback showcase.',
    tags: ['Comeback', 'Showcase', 'New Album'],
    saleStatus: 'coming-soon',
    saleDate: '2026-03-01T10:00:00',
    dates: [
      { id: 'd1', date: '2026-06-01', time: '18:00', venue: 'Gocheok Sky Dome', city: 'Seoul', available: true },
    ],
    grades: [
      { id: 'r', label: 'R', price: 95, originalPrice: 130, totalSeats: 1000, availableSeats: 342 },
      { id: 's', label: 'S', price: 130, totalSeats: 5000, availableSeats: 4500 },
    ],
  },
  {
    id: 'stellar-dome-tour',
    title: 'STELLAR DOME TOUR',
    artist: 'STELLAR',
    subtitle: 'Gravity',
    image: '/images/event-4.jpg',
    category: 'Concert',
    description:
      'STELLAR\'s massive dome tour brings their signature high-energy performances to arenas worldwide.',
    tags: ['Dome Tour', 'Concert', 'Holographic'],
    saleStatus: 'on-sale',
    dates: [
      { id: 'd1', date: '2026-07-12', time: '18:30', venue: 'Tokyo Dome', city: 'Tokyo', available: true },
      { id: 'd2', date: '2026-07-15', time: '18:30', venue: 'Kyocera Dome', city: 'Osaka', available: true },
      { id: 'd3', date: '2026-08-01', time: '19:00', venue: 'Staples Center', city: 'Los Angeles', available: true },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 500, totalSeats: 100, availableSeats: 12 },
      { id: 'r', label: 'R', price: 280, totalSeats: 800, availableSeats: 430 },
      { id: 's', label: 'S', price: 150, totalSeats: 3000, availableSeats: 1200 },
    ],
  },
  {
    id: 'bloom-solo-concert',
    title: 'BLOOM SOLO CONCERT',
    artist: 'BLOOM',
    subtitle: 'Petals in the Wind',
    image: '/images/event-5.jpg',
    category: 'Concert',
    description:
      'BLOOM\'s debut solo concert. An emotional evening of acoustic performances, new solo tracks, and heartfelt fan interactions.',
    tags: ['Solo', 'Concert', 'Debut'],
    saleStatus: 'sold-out',
    dates: [
      { id: 'd1', date: '2026-03-28', time: '19:00', venue: 'Seoul Arts Center', city: 'Seoul', available: false },
      { id: 'd2', date: '2026-03-29', time: '19:00', venue: 'Seoul Arts Center', city: 'Seoul', available: false },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 200, totalSeats: 60, availableSeats: 0 },
      { id: 's', label: 'S', price: 90, totalSeats: 1500, availableSeats: 0 },
    ],
  },
  {
    id: 'prism-festival',
    title: 'PRISM MUSIC FESTIVAL 2026',
    artist: 'Various Artists',
    subtitle: 'Where Sound Meets Light',
    image: '/images/event-6.jpg',
    category: 'Festival',
    description:
      'The biggest music festival of the year featuring 20+ artists across 3 stages over 2 days.',
    tags: ['Festival', 'Multi-Artist', '2 Days'],
    saleStatus: 'on-sale',
    dates: [
      { id: 'd1', date: '2026-08-15', time: '12:00', venue: 'Olympic Park', city: 'Seoul', available: true },
      { id: 'd2', date: '2026-08-16', time: '12:00', venue: 'Olympic Park', city: 'Seoul', available: true },
    ],
    grades: [
      { id: 'vip', label: 'VIP', price: 380, originalPrice: 450, totalSeats: 500, availableSeats: 200 },
      { id: 'r', label: 'R', price: 180, totalSeats: 8000, availableSeats: 3500 },
      { id: 'a', label: 'A', price: 100, totalSeats: 5000, availableSeats: 2000 },
    ],
  },
]
