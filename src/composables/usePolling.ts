import { onUnmounted } from 'vue'

export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    stop()
    timer = setInterval(async () => {
      await callback()
    }, intervalMs)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(stop)

  return { start, stop }
}
