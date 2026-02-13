<script setup lang="ts">
import { computed } from 'vue'
import type { VenueSectionInfo } from '@/types/seat'

const props = defineProps<{
  sections: VenueSectionInfo[]
  selectedSectionId: string | null
  sectionBadges?: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'select', sectionId: string, grade: string): void
}>()

/* ─── SVG layout constants ───────────────────────────── */
const CX = 400
const CY = 385
const viewBox = '0 0 800 800'

/* ─── Polar coordinate helpers ───────────────────────── */
function toXY(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) }
}

function arcPath(sa: number, ea: number, r1: number, r2: number) {
  const p1 = toXY(sa, r1)
  const p2 = toXY(ea, r1)
  const p3 = toXY(ea, r2)
  const p4 = toXY(sa, r2)
  const largeArc = ea - sa > 180 ? 1 : 0
  return [
    `M${p1.x},${p1.y}`,
    `A${r1},${r1} 0 ${largeArc} 1 ${p2.x},${p2.y}`,
    `L${p3.x},${p3.y}`,
    `A${r2},${r2} 0 ${largeArc} 0 ${p4.x},${p4.y}`,
    'Z',
  ].join(' ')
}

function labelXY(sa: number, ea: number, r1: number, r2: number) {
  const mid = (sa + ea) / 2
  const rMid = (r1 + r2) / 2
  return toXY(mid, rMid)
}

/* ─── Section geometry ───────────────────────────────── */
const colors: Record<string, { fill: string; hover: string }> = {
  vip: { fill: '#7B3FA0', hover: '#9B5FC0' },
  s: { fill: '#8B9EC8', hover: '#ABBEE8' },
  a: { fill: '#D4884E', hover: '#E4A87E' },
}

/* Floor sections A–H (VIP grade) */
const floorIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const floorRects = [
  { id: 'A', x: 232, y: 270, w: 72, h: 60 },
  { id: 'B', x: 310, y: 270, w: 72, h: 60 },
  { id: 'C', x: 418, y: 270, w: 72, h: 60 },
  { id: 'D', x: 496, y: 270, w: 72, h: 60 },
  { id: 'E', x: 279, y: 410, w: 56, h: 44 },
  { id: 'F', x: 341, y: 410, w: 56, h: 44 },
  { id: 'G', x: 403, y: 410, w: 56, h: 44 },
  { id: 'H', x: 465, y: 410, w: 56, h: 44 },
]

/* 1F sections 1–15: inner arc ring — 3~13 are VIP, 1,2,14,15 are S */
const VIP_1F = new Set(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'])
const ring1 = computed(() => {
  const ids = Array.from({ length: 15 }, (_, i) => String(i + 1))
  const startAngle = 83
  const endAngle = 277
  const gap = 1.0
  const sectionSpan = (endAngle - startAngle - gap * (ids.length - 1)) / ids.length
  const r1 = 162
  const r2 = 224

  return ids.map((id, i) => {
    const sa = startAngle + i * (sectionSpan + gap)
    const ea = sa + sectionSpan
    const grade = VIP_1F.has(id) ? 'vip' : 's'
    return {
      id,
      sa,
      ea,
      r1,
      r2,
      grade,
      path: arcPath(sa, ea, r1, r2),
      label: labelXY(sa, ea, r1, r2),
    }
  })
})

/* 2F sections 24–43: outer arc ring — 27~40 are S, rest are A */
const S_2F = new Set([
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
])
const ring2 = computed(() => {
  const ids = Array.from({ length: 20 }, (_, i) => String(i + 24))
  const startAngle = 80
  const endAngle = 280
  const gap = 0.8
  const sectionSpan = (endAngle - startAngle - gap * (ids.length - 1)) / ids.length
  const r1 = 232
  const r2 = 306

  return ids.map((id, i) => {
    const sa = startAngle + i * (sectionSpan + gap)
    const ea = sa + sectionSpan
    const grade = S_2F.has(id) ? 's' : 'a'
    return {
      id,
      sa,
      ea,
      r1,
      r2,
      grade,
      path: arcPath(sa, ea, r1, r2),
      label: labelXY(sa, ea, r1, r2),
    }
  })
})

/* ─── Helpers ────────────────────────────────────────── */
function getSectionInfo(id: string): VenueSectionInfo | undefined {
  return props.sections.find((s) => s.id === id)
}

function getGrade(id: string): string {
  const r1Sec = ring1.value.find((s) => s.id === id)
  if (r1Sec) return r1Sec.grade
  const r2Sec = ring2.value.find((s) => s.id === id)
  if (r2Sec) return r2Sec.grade
  if (floorIds.includes(id)) return 'vip'
  return getSectionInfo(id)?.grade ?? 'a'
}

function isSoldOut(id: string): boolean {
  const info = getSectionInfo(id)
  return info ? info.availableSeats === 0 : false
}

function isSelected(id: string): boolean {
  return props.selectedSectionId === id
}

function sectionFill(id: string, grade: string): string {
  const c = colors[grade] ?? colors.a!
  return isSelected(id) ? c!.hover : c!.fill
}

function handleClick(id: string) {
  if (isSoldOut(id)) return
  emit('select', id, getGrade(id))
}
</script>

<template>
  <svg :viewBox="viewBox" class="w-full h-auto select-none" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="800" height="800" fill="#16162A" rx="16" />

    <!-- Title -->
    <rect
      x="300"
      y="55"
      width="200"
      height="36"
      fill="none"
      stroke="#FFFFFF"
      stroke-width="1.5"
      rx="2"
    />
    <text
      x="400"
      y="80"
      text-anchor="middle"
      fill="#FFFFFF"
      font-size="16"
      font-weight="700"
      font-family="sans-serif"
    >
      좌석배치도
    </text>

    <!-- STAGE (I-shape) -->
    <path
      d="M250,175 L550,175 L550,245 L412,245 L412,340 L505,340 L505,398 L295,398 L295,340 L388,340 L388,245 L250,245 Z"
      fill="#3D3560"
    />
    <text
      x="400"
      y="217"
      text-anchor="middle"
      fill="#FFFFFF"
      font-size="22"
      font-weight="700"
      font-family="sans-serif"
      letter-spacing="5"
    >
      STAGE
    </text>

    <!-- FLOOR label -->
    <text x="205" y="260" fill="#8888AA" font-size="11" font-family="sans-serif">FLOOR</text>

    <!-- Floor sections (VIP) -->
    <g
      v-for="rect in floorRects"
      :key="'floor-' + rect.id"
      :class="isSoldOut(rect.id) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
      @click="handleClick(rect.id)"
    >
      <rect
        :x="rect.x"
        :y="rect.y"
        :width="rect.w"
        :height="rect.h"
        rx="4"
        :fill="sectionFill(rect.id, 'vip')"
        stroke="#12122A"
        stroke-width="1"
      />
      <text
        :x="rect.x + rect.w / 2"
        :y="rect.y + rect.h / 2 + 5"
        text-anchor="middle"
        fill="#FFFFFF"
        font-size="16"
        font-weight="700"
        font-family="sans-serif"
        class="pointer-events-none"
      >
        {{ rect.id }}
      </text>
      <circle
        v-if="isSelected(rect.id)"
        :cx="rect.x + rect.w / 2"
        :cy="rect.y + rect.h / 2"
        r="20"
        fill="none"
        stroke="#FFD700"
        stroke-width="2.5"
        class="pointer-events-none"
      />
      <!-- 선택 수 뱃지 -->
      <g v-if="sectionBadges?.[rect.id]" class="pointer-events-none">
        <circle :cx="rect.x + rect.w - 4" :cy="rect.y + 4" r="9" fill="#EC4899" />
        <text
          :x="rect.x + rect.w - 4"
          :y="rect.y + 8"
          text-anchor="middle"
          fill="#FFFFFF"
          font-size="10"
          font-weight="700"
          font-family="sans-serif"
        >{{ sectionBadges[rect.id] }}</text>
      </g>
    </g>

    <!-- F.O.H -->
    <rect x="335" y="495" width="130" height="22" rx="3" fill="#222240" />
    <text
      x="400"
      y="511"
      text-anchor="middle"
      fill="#8888AA"
      font-size="10"
      font-weight="500"
      font-family="sans-serif"
    >
      F.O.H
    </text>

    <!-- 1F / 2F labels (above section 15 / 43) -->
    <text x="180" y="350" fill="#8888AA" font-size="11" font-family="sans-serif">1F</text>
    <text x="99" y="323" fill="#8888AA" font-size="11" font-family="sans-serif">2F</text>

    <!-- 1F ring (inner) -->
    <g
      v-for="sec in ring1"
      :key="'1f-' + sec.id"
      :class="isSoldOut(sec.id) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
      @click="handleClick(sec.id)"
    >
      <path
        :d="sec.path"
        :fill="sectionFill(sec.id, sec.grade)"
        stroke="#12122A"
        stroke-width="1.2"
      />
      <text
        :x="sec.label.x"
        :y="sec.label.y + 4"
        text-anchor="middle"
        fill="#FFFFFF"
        :font-size="sec.id.length > 1 ? 10 : 12"
        font-weight="600"
        font-family="sans-serif"
        class="pointer-events-none"
      >
        {{ sec.id }}
      </text>
      <circle
        v-if="isSelected(sec.id)"
        :cx="sec.label.x"
        :cy="sec.label.y"
        r="14"
        fill="none"
        stroke="#FFD700"
        stroke-width="2.5"
        class="pointer-events-none"
      />
      <g v-if="sectionBadges?.[sec.id]" class="pointer-events-none">
        <circle :cx="sec.label.x + 12" :cy="sec.label.y - 12" r="8" fill="#EC4899" />
        <text
          :x="sec.label.x + 12"
          :y="sec.label.y - 8"
          text-anchor="middle"
          fill="#FFFFFF"
          font-size="9"
          font-weight="700"
          font-family="sans-serif"
        >{{ sectionBadges[sec.id] }}</text>
      </g>
    </g>

    <!-- 2F ring (outer) -->
    <g
      v-for="sec in ring2"
      :key="'2f-' + sec.id"
      :class="isSoldOut(sec.id) ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
      @click="handleClick(sec.id)"
    >
      <path
        :d="sec.path"
        :fill="sectionFill(sec.id, sec.grade)"
        stroke="#12122A"
        stroke-width="1.2"
      />
      <text
        :x="sec.label.x"
        :y="sec.label.y + 4"
        text-anchor="middle"
        fill="#FFFFFF"
        :font-size="sec.id.length > 1 ? 10 : 12"
        font-weight="600"
        font-family="sans-serif"
        class="pointer-events-none"
      >
        {{ sec.id }}
      </text>
      <circle
        v-if="isSelected(sec.id)"
        :cx="sec.label.x"
        :cy="sec.label.y"
        r="14"
        fill="none"
        stroke="#FFD700"
        stroke-width="2.5"
        class="pointer-events-none"
      />
      <g v-if="sectionBadges?.[sec.id]" class="pointer-events-none">
        <circle :cx="sec.label.x + 12" :cy="sec.label.y - 12" r="8" fill="#EC4899" />
        <text
          :x="sec.label.x + 12"
          :y="sec.label.y - 8"
          text-anchor="middle"
          fill="#FFFFFF"
          font-size="9"
          font-weight="700"
          font-family="sans-serif"
        >{{ sectionBadges[sec.id] }}</text>
      </g>
    </g>

    <!-- Legend (centered, S at x=400) -->
    <g transform="translate(310, 770)">
      <circle cx="0" cy="0" r="7" fill="#7B3FA0" />
      <text x="13" y="5" fill="#7B3FA0" font-size="13" font-weight="700" font-family="sans-serif">
        VIP
      </text>

      <circle cx="90" cy="0" r="7" fill="#8B9EC8" />
      <text x="103" y="5" fill="#8B9EC8" font-size="13" font-weight="700" font-family="sans-serif">
        S
      </text>

      <circle cx="170" cy="0" r="7" fill="#D4884E" />
      <text x="183" y="5" fill="#D4884E" font-size="13" font-weight="700" font-family="sans-serif">
        A
      </text>
    </g>
  </svg>
</template>
