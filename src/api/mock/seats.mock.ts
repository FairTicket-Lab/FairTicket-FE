import type { Seat, SeatSection } from '@/types/seat'

function generateSeats(
  sectionId: string,
  gradeId: string,
  rows: string[],
  seatsPerRow: number,
  startX: number,
  startY: number,
  soldRatio: number
): Seat[] {
  const seats: Seat[] = []
  rows.forEach((row, ri) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      const rand = Math.random()
      let status: Seat['status'] = 'available'
      if (rand < soldRatio) status = 'sold'
      else if (rand < soldRatio + 0.05) status = 'held'

      seats.push({
        id: `${sectionId}-${row}${i}`,
        section: sectionId,
        row,
        number: i,
        gradeId,
        status,
        x: startX + (i - 1) * 28,
        y: startY + ri * 28,
      })
    }
  })
  return seats
}

export function getMockSeatSections(): SeatSection[] {
  return [
    {
      id: 'vip',
      label: 'VIP',
      seats: generateSeats('vip', 'vip', ['A', 'B', 'C'], 16, 120, 80, 0.7),
    },
    {
      id: 'r',
      label: 'R석',
      seats: generateSeats('r', 'r', ['D', 'E', 'F', 'G'], 20, 64, 170, 0.4),
    },
    {
      id: 's',
      label: 'S석',
      seats: generateSeats('s', 's', ['H', 'I', 'J', 'K', 'L'], 24, 8, 290, 0.2),
    },
    {
      id: 'a',
      label: 'A석',
      seats: generateSeats('a', 'a', ['M', 'N', 'O'], 24, 8, 440, 0.1),
    },
  ]
}
