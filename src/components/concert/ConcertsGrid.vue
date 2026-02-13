<script setup lang="ts">
import type { Concert } from '@/types/concert'
import ConcertCard from './ConcertCard.vue'

const props = defineProps<{ concerts: Concert[] }>()
</script>

<template>
  <section class="px-4 lg:px-8 mx-auto max-w-7xl py-10">
    <!-- 그리드 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ConcertCard v-for="concert in concerts" :key="concert.id" :concert="concert" />
    </div>

    <!-- 빈 상태 -->
    <div v-if="concerts.length === 0" class="text-center py-20">
      <p class="text-muted-foreground">등록된 공연이 없습니다.</p>
    </div>
  </section>
</template>
