<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Concert } from '@/types/concert'
import { concertApi } from '@/api/concert.api'
import ConcertsGrid from '@/components/concert/ConcertsGrid.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const concerts = ref<Concert[]>([])
const loading = ref(true)
const current = ref(0)
let timer = 0

const heroSlides = computed(() => concerts.value)

onMounted(async () => {
  try {
    concerts.value = await concertApi.getAll()
  } finally {
    loading.value = false
    startTimer()
  }
})

onUnmounted(() => clearInterval(timer))

// ── Carousel timer ──────────────────────────────────────
function startTimer() {
  clearInterval(timer)
  if (heroSlides.value.length <= 1) return
  timer = window.setInterval(() => {
    current.value = (current.value + 1) % heroSlides.value.length
  }, 5000)
}

function next() {
  if (heroSlides.value.length <= 1) return
  current.value = (current.value + 1) % heroSlides.value.length
  startTimer()
}

function prev() {
  if (heroSlides.value.length <= 1) return
  current.value = (current.value - 1 + heroSlides.value.length) % heroSlides.value.length
  startTimer()
}

function goTo(i: number) {
  current.value = i
  startTimer()
}

// ── Helpers ─────────────────────────────────────────────
const statusMap: Record<string, { text: string; cls: string }> = {
  'on-sale': { text: '예매중', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'coming-soon': { text: '예정', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'sold-out': { text: '매진', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- 로딩: Skeleton -->
    <div v-if="loading">
      <div class="relative w-full h-[75vh] min-h-[500px] skeleton" />
      <section class="px-4 lg:px-8 mx-auto max-w-7xl py-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard v-for="i in 6" :key="i" />
        </div>
      </section>
    </div>

    <template v-else>
      <!-- ── Hero Carousel ── -->
      <section
        v-if="heroSlides.length"
        class="relative w-full h-[75vh] min-h-[500px] overflow-hidden bg-background"
      >
        <!-- Slides -->
        <div
          v-for="(concert, idx) in heroSlides"
          :key="concert.id"
          class="hero-slide"
          :class="idx === current ? 'is-active' : ''"
        >
          <!-- 배경 이미지 + Ken Burns -->
          <img
            :src="concert.image"
            :alt="concert.title"
            class="hero-img"
            :class="idx === current ? 'zoom-in' : ''"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          <!-- 콘텐츠 -->
          <div class="absolute inset-0 flex flex-col justify-end pb-20 lg:pb-24 px-4 lg:px-8">
            <div class="mx-auto max-w-7xl w-full">
              <div class="max-w-2xl">
                <!-- 뱃지 -->
                <div class="flex items-center gap-3 mb-4">
                  <span
                    class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border"
                    :class="statusMap[concert.saleStatus]?.cls"
                  >
                    {{ statusMap[concert.saleStatus]?.text }}
                  </span>
                </div>

                <!-- 타이틀 -->
                <h2
                  class="font-display text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-3 slide-content"
                  :class="idx === current ? 'content-in' : ''"
                  style="--d: 0.1s"
                >
                  {{ concert.title }}
                </h2>
                <p
                  class="text-base md:text-xl text-muted-foreground mb-2 slide-content"
                  :class="idx === current ? 'content-in' : ''"
                  style="--d: 0.2s"
                >
                  {{ concert.artist }}
                </p>

                <!-- 날짜/장소 -->
                <div
                  v-if="concert.dates.length"
                  class="flex items-center gap-2 text-muted-foreground mb-8 slide-content"
                  :class="idx === current ? 'content-in' : ''"
                  style="--d: 0.3s"
                >
                  <CalendarDays class="w-4 h-4" />
                  <span class="text-sm">
                    {{ formatDate(concert.dates[0].date) }} · {{ concert.dates[0].venue }}
                  </span>
                </div>

                <!-- CTA -->
                <div
                  class="flex flex-col sm:flex-row gap-3 slide-content"
                  :class="idx === current ? 'content-in' : ''"
                  style="--d: 0.4s"
                >
                  <RouterLink
                    :to="`/concerts/${concert.id}`"
                    class="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 gap-2"
                  >
                    지금 예매하기
                    <ArrowRight class="w-4 h-4" />
                  </RouterLink>
                  <RouterLink
                    :to="`/concerts/${concert.id}`"
                    class="inline-flex items-center justify-center h-12 px-8 rounded-full border border-border text-foreground font-semibold text-base hover:bg-secondary transition-colors"
                  >
                    상세 보기
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation arrows -->
        <template v-if="heroSlides.length > 1">
          <button
            class="hero-nav hero-nav-left"
            @click="prev"
          >
            <ChevronLeft :size="22" />
          </button>
          <button
            class="hero-nav hero-nav-right"
            @click="next"
          >
            <ChevronRight :size="22" />
          </button>

          <!-- Dots + Progress -->
          <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            <button
              v-for="(_, i) in heroSlides"
              :key="i"
              class="hero-dot"
              :class="i === current ? 'is-active' : ''"
              @click="goTo(i)"
            >
              <span v-if="i === current" class="hero-dot-progress" />
            </button>
          </div>
        </template>
      </section>

      <!-- 콘서트 그리드 -->
      <ConcertsGrid :concerts="concerts" />
    </template>
  </div>
</template>

<style scoped>
/* ── Slide layer ─────────────────────────────────────── */
.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  z-index: 0;
  transition: opacity 0.8s ease-in-out;
}

.hero-slide.is-active {
  opacity: 1;
  z-index: 10;
}

/* ── Hero image + Ken Burns zoom ─────────────────────── */
.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 0.5s ease;
}

.hero-img.zoom-in {
  animation: ken-burns 5.5s ease-out forwards;
}

@keyframes ken-burns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

/* ── Staggered content entrance ──────────────────────── */
.slide-content {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--d, 0s);
}

.slide-content.content-in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Navigation arrows ───────────────────────────────── */
.hero-nav {
  position: absolute;
  top: 50%;
  z-index: 20;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.5);
  backdrop-filter: blur(8px);
  color: hsl(var(--foreground));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.3s,
    background 0.2s;
}

section:hover .hero-nav {
  opacity: 1;
}

.hero-nav:hover {
  background: hsl(var(--secondary));
}

.hero-nav-left {
  left: 16px;
}

.hero-nav-right {
  right: 16px;
}

/* ── Dots ────────────────────────────────────────────── */
.hero-dot {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  border: none;
  background: hsl(var(--foreground) / 0.3);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 0;
}

.hero-dot:hover {
  background: hsl(var(--foreground) / 0.5);
}

.hero-dot.is-active {
  width: 36px;
  background: hsl(var(--foreground) / 0.15);
}

/* Progress fill inside active dot */
.hero-dot-progress {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: hsl(var(--foreground) / 0.9);
  transform-origin: left;
  animation: dot-fill 5s linear forwards;
}

@keyframes dot-fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 640px) {
  .hero-nav {
    width: 36px;
    height: 36px;
  }

  .hero-nav-left {
    left: 8px;
  }

  .hero-nav-right {
    right: 8px;
  }
}
</style>
