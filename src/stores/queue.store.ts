import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { QueueEntry, QueueStatus } from '@/types/queue'
import { queueApi } from '@/api/queue.api'

export const useQueueStore = defineStore('queue', () => {
  const entry = ref<QueueEntry | null>(null)
  const status = ref<QueueStatus | null>(null)
  const position = ref(0)
  const estimatedWait = ref(0)
  const readyToken = ref<string | null>(null)

  async function join(concertId: string) {
    const res = await queueApi.join(concertId)
    entry.value = res
    status.value = res.status
    position.value = res.position
    estimatedWait.value = res.estimatedWaitSeconds
  }

  async function poll() {
    if (!entry.value) return
    const res = await queueApi.poll(entry.value.queueId)
    status.value = res.status
    position.value = res.position
    estimatedWait.value = res.estimatedWaitSeconds
    if (res.token) {
      readyToken.value = res.token
    }
  }

  async function heartbeat() {
    if (!entry.value) return
    await queueApi.heartbeat(entry.value.queueId)
  }

  async function cancel() {
    if (!entry.value) return
    await queueApi.cancel(entry.value.queueId)
    reset()
  }

  function reset() {
    entry.value = null
    status.value = null
    position.value = 0
    estimatedWait.value = 0
    readyToken.value = null
  }

  return { entry, status, position, estimatedWait, readyToken, join, poll, heartbeat, cancel, reset }
})
