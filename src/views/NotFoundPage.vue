<script setup lang="ts">
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
    <p class="font-display text-7xl font-bold text-primary mb-4">404</p>
    <h1 class="font-display text-2xl font-bold text-foreground mb-2">페이지를 찾을 수 없습니다</h1>
    <p class="text-muted-foreground mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
    <RouterLink
      to="/concerts"
      class="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
    >
      홈으로 돌아가기
    </RouterLink>
  </div>
</template>
