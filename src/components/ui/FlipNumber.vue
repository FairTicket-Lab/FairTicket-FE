<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{ value: number }>()

const displayed = ref(props.value)
const flipping = ref(false)

const formatted = computed(() => displayed.value.toLocaleString())

watch(
  () => props.value,
  (newVal) => {
    if (newVal === displayed.value) return
    flipping.value = true
    setTimeout(() => {
      displayed.value = newVal
      setTimeout(() => {
        flipping.value = false
      }, 300)
    }, 150)
  }
)
</script>

<template>
  <span
    class="inline-block transition-all duration-300"
    :class="flipping ? 'flip-out' : 'flip-in'"
  >
    {{ formatted }}
  </span>
</template>
