import type { Seat, SeatSection, VenueSectionInfo } from '@/types/seat'

/* ─── Section config for the venue ────────────────────── */
interface SectionConfig {
  id: string
  grade: string
  rows: number
  seatsPerRow: number
  soldRatio: number
}

const FLOOR_SECTIONS: SectionConfig[] = [
  { id: 'A', grade: 'vip', rows: 6, seatsPerRow: 12, soldRatio: 0.7 },
  { id: 'B', grade: 'vip', rows: 6, seatsPerRow: 12, soldRatio: 0.8 },
  { id: 'C', grade: 'vip', rows: 6, seatsPerRow: 12, soldRatio: 0.75 },
  { id: 'D', grade: 'vip', rows: 6, seatsPerRow: 12, soldRatio: 0.65 },
  { id: 'E', grade: 'vip', rows: 5, seatsPerRow: 10, soldRatio: 0.6 },
  { id: 'F', grade: 'vip', rows: 5, seatsPerRow: 10, soldRatio: 0.55 },
  { id: 'G', grade: 'vip', rows: 5, seatsPerRow: 10, soldRatio: 0.5 },
  { id: 'H', grade: 'vip', rows: 5, seatsPerRow: 10, soldRatio: 0.45 },
]

/**
 * 1F 섹션: init.sql zones 기준
 * - 섹션 3~13: VIP (11개)
 * - 섹션 1, 2, 14, 15: S (4개)
 */
const VIP_1F = new Set(['3','4','5','6','7','8','9','10','11','12','13'])

const SECTIONS_1F: SectionConfig[] = Array.from({ length: 15 }, (_, i) => {
  const id = String(i + 1)
  return {
    id,
    grade: VIP_1F.has(id) ? 'vip' : 's',
    rows: 5,
    seatsPerRow: 10,
    soldRatio: VIP_1F.has(id) ? 0.4 : 0.3,
  }
})

/**
 * 2F 섹션: init.sql zones 기준
 * - 섹션 27~40: S (14개)
 * - 섹션 24, 25, 26, 41, 42, 43: A (6개)
 */
const S_2F = new Set(['27','28','29','30','31','32','33','34','35','36','37','38','39','40'])

const SECTIONS_2F: SectionConfig[] = Array.from({ length: 20 }, (_, i) => {
  const id = String(i + 24)
  return {
    id,
    grade: S_2F.has(id) ? 's' : 'a',
    rows: 6,
    seatsPerRow: 12,
    soldRatio: S_2F.has(id) ? 0.2 : 0.15,
  }
})

const ALL_SECTIONS: SectionConfig[] = [...FLOOR_SECTIONS, ...SECTIONS_1F, ...SECTIONS_2F]

/* ─── Session-level cache ─────────────────────────────── */
const cache: Record<string, SeatSection> = {}

function buildSectionSeats(config: SectionConfig): SeatSection {
  const cached = cache[config.id]
  if (cached) return cached

  const seats: Seat[] = []
  const rowLabels = Array.from({ length: config.rows }, (_, i) =>
    String.fromCharCode(65 + i),
  )

  const startX = Math.max(20, Math.floor((700 - config.seatsPerRow * 28) / 2))
  const startY = 80

  for (let ri = 0; ri < config.rows; ri++) {
    const rowLabel = rowLabels[ri] ?? String(ri)
    for (let si = 1; si <= config.seatsPerRow; si++) {
      const status: Seat['status'] = 'available'

      seats.push({
        id: `${config.id}-${rowLabel}${si}`,
        section: config.id,
        row: rowLabel,
        number: si,
        gradeId: config.grade,
        status,
        x: startX + (si - 1) * 28,
        y: startY + ri * 28,
      })
    }
  }

  const section: SeatSection = {
    id: config.id,
    label: `${config.id}구역`,
    seats,
  }

  cache[config.id] = section
  return section
}

/* ─── Public API ──────────────────────────────────────── */

export function getMockVenueSections(): VenueSectionInfo[] {
  return ALL_SECTIONS.map((config) => {
    const section = buildSectionSeats(config)
    const available = section.seats.filter((s) => s.status === 'available').length
    return {
      id: config.id,
      label: config.id,
      grade: config.grade,
      totalSeats: section.seats.length,
      availableSeats: available,
    }
  })
}

export function getMockSectionSeats(sectionId: string): SeatSection[] {
  const config = ALL_SECTIONS.find((s) => s.id === sectionId)
  if (!config) return []
  return [buildSectionSeats(config)]
}

/** @deprecated Use getMockVenueSections + getMockSectionSeats instead */
export function getMockSeatSections(): SeatSection[] {
  return ALL_SECTIONS.map((config) => buildSectionSeats(config))
}
