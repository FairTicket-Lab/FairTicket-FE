<template>
  <div class="rounded-xl overflow-hidden bg-card border border-border">
    <!-- Image skeleton -->
    <div class="aspect-[16/10] skeleton" />
    <!-- Content skeleton -->
    <div class="p-4 space-y-3">
      <div class="h-5 w-3/4 skeleton rounded" />
      <div class="h-4 w-1/2 skeleton rounded" />
      <div class="flex items-center justify-between pt-2">
        <div class="space-y-2">
          <div class="h-3 w-20 skeleton rounded" />
          <div class="h-3 w-16 skeleton rounded" />
        </div>
        <div class="text-right space-y-1">
          <div class="h-3 w-10 skeleton rounded ml-auto" />
          <div class="h-5 w-20 skeleton rounded" />
        </div>
      </div>
    </div>
  </div>
</template>
