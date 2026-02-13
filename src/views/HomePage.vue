<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Concert } from '@/types/concert'
import { concertApi } from '@/api/concert.api'
import ConcertsGrid from '@/components/concert/ConcertsGrid.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { ArrowRight, CalendarDays, Loader2 } from 'lucide-vue-next'

const concerts = ref<Concert[]>([])
const loading = ref(true)

// Parallax
const scrollY = ref(0)
function onScroll() {
  scrollY.value = window.scrollY
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  try {
    concerts.value = await concertApi.getAll()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// 히어로에 표시할 피처 콘서트 (on-sale 중 첫 번째)
const heroConcert = computed(() =>
  concerts.value.find((c) => c.saleStatus === 'on-sale')
)

const heroNextDate = computed(() => heroConcert.value?.dates.find((d) => d.available))

const heroFormattedDate = computed(() => {
  if (!heroNextDate.value) return ''
  return new Date(heroNextDate.value.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const parallaxStyle = computed(() => ({
  transform: `translateY(${scrollY.value * 0.3}px) scale(${1 + scrollY.value * 0.0003})`,
}))
</script>

<template>
  <div>
  <!-- 로딩: Skeleton -->
  <div v-if="loading">
    <!-- Hero skeleton -->
    <div class="relative w-full h-[75vh] min-h-[500px] skeleton" />
    <!-- Grid skeleton -->
    <section class="px-4 lg:px-8 mx-auto max-w-7xl py-10">
      <div class="flex items-center gap-2 mb-8">
        <div class="h-9 w-16 skeleton rounded-full" />
        <div class="h-9 w-20 skeleton rounded-full" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
    </section>
  </div>

  <template v-else>
    <!-- 히어로 배너 with Parallax -->
    <section v-if="heroConcert" class="relative w-full h-[75vh] min-h-[500px] overflow-hidden">
      <!-- 배경 이미지 (Parallax) -->
      <div class="absolute inset-0">
        <img
          :src="heroConcert.image"
          :alt="heroConcert.title"
          class="w-full h-full object-cover parallax-hero"
          :style="parallaxStyle"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      <!-- 콘텐츠 -->
      <div class="relative h-full flex flex-col justify-end pb-12 lg:pb-20 px-4 lg:px-8 mx-auto max-w-7xl">
        <div class="max-w-2xl">
          <!-- 뱃지 -->
          <div class="flex items-center gap-3 mb-4">
            <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              예매중
            </span>
          </div>

          <!-- 타이틀 -->
          <h1 class="font-display text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-3">
            {{ heroConcert.title }}
          </h1>
          <p class="text-base md:text-xl text-muted-foreground mb-2">
            {{ heroConcert.artist }}
          </p>

          <!-- 날짜/장소 -->
          <div v-if="heroNextDate" class="flex items-center gap-2 text-muted-foreground mb-8">
            <CalendarDays class="w-4 h-4" />
            <span class="text-sm">
              {{ heroFormattedDate }} · {{ heroNextDate.venue }}
            </span>
          </div>

          <!-- CTA 버튼 -->
          <div class="flex flex-col sm:flex-row gap-3">
            <RouterLink
              :to="`/concerts/${heroConcert.id}`"
              class="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 gap-2"
            >
              지금 예매하기
              <ArrowRight class="w-4 h-4" />
            </RouterLink>
            <RouterLink
              :to="`/concerts/${heroConcert.id}`"
              class="inline-flex items-center justify-center h-12 px-8 rounded-full border border-border text-foreground font-semibold text-base hover:bg-secondary transition-colors"
            >
              상세 보기
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 콘서트 그리드 -->
    <ConcertsGrid :concerts="concerts" />
  </template>
  </div>
</template>
