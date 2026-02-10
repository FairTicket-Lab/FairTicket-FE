<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  position: number
  totalAhead: number
  estimatedWaitSeconds: number
}>()

const progress = computed(() => {
  if (props.totalAhead <= 0) return 100
  return Math.min(100, Math.max(0, ((props.totalAhead - props.position) / props.totalAhead) * 100))
})

const waitDisplay = computed(() => {
  const s = props.estimatedWaitSeconds
  if (s < 60) return `${s}초`
  const m = Math.floor(s / 60)
  const sec = s % 60
  return sec > 0 ? `${m}분 ${sec}초` : `${m}분`
})
</script>

<template>
  <div class="space-y-4">
    <!-- 프로그레스 바 -->
    <div class="h-2 bg-secondary rounded-full overflow-hidden">
      <div
        class="h-full bg-primary rounded-full transition-all duration-700 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- 수치 -->
    <div class="flex items-center justify-between text-sm">
      <div>
        <span class="text-muted-foreground">내 순번</span>
        <span class="font-display font-bold text-foreground ml-2 text-lg">
          {{ position.toLocaleString() }}
        </span>
      </div>
      <div class="text-right">
        <span class="text-muted-foreground">예상 대기</span>
        <span class="font-display font-bold text-foreground ml-2">
          {{ waitDisplay }}
        </span>
      </div>
    </div>
  </div>
</template>
