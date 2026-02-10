<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Concert } from '@/types/concert'
import ConcertCard from './ConcertCard.vue'

const props = defineProps<{ concerts: Concert[] }>()

const categories = ['All', 'Concert', 'Fan Meeting', 'Showcase', 'Festival']
const activeCategory = ref('All')

const filtered = computed(() => {
  if (activeCategory.value === 'All') return props.concerts
  return props.concerts.filter((c) => c.category === activeCategory.value)
})
</script>

<template>
  <section class="px-4 lg:px-8 mx-auto max-w-7xl py-10">
    <!-- 카테고리 필터 -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
          activeCategory === cat
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ]"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 그리드 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ConcertCard v-for="concert in filtered" :key="concert.id" :concert="concert" />
    </div>

    <!-- 빈 상태 -->
    <div v-if="filtered.length === 0" class="text-center py-20">
      <p class="text-muted-foreground">해당 카테고리의 공연이 없습니다.</p>
    </div>
  </section>
</template>
