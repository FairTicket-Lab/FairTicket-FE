import { ref, onUnmounted, computed } from 'vue'

export function useCountdown(targetTime: string | null) {
  const remaining = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function calcRemaining() {
    if (!targetTime) return 0
    return Math.max(0, Math.floor((new Date(targetTime).getTime() - Date.now()) / 1000))
  }

  function start() {
    remaining.value = calcRemaining()
    timer = setInterval(() => {
      remaining.value = calcRemaining()
      if (remaining.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(stop)

  const minutes = computed(() => Math.floor(remaining.value / 60))
  const seconds = computed(() => remaining.value % 60)
  const display = computed(
    () => `${String(minutes.value).padStart(2, '0')}:${String(seconds.value).padStart(2, '0')}`
  )
  const isExpired = computed(() => remaining.value <= 0 && targetTime !== null)

  return { remaining, minutes, seconds, display, isExpired, start, stop }
}
