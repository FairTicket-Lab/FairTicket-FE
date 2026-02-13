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
  const scheduleId = ref<string | null>(null)

  async function join(id: string) {
    scheduleId.value = id
    const res = await queueApi.join(id)
    entry.value = res
    status.value = res.status
    position.value = res.position
    estimatedWait.value = res.estimatedWaitSeconds
  }

  async function poll() {
    if (!scheduleId.value) return
    const res = await queueApi.poll(scheduleId.value)
    status.value = res.status
    position.value = res.position
    estimatedWait.value = res.estimatedWaitSeconds
    if (res.token) {
      readyToken.value = res.token
    }
  }

  async function heartbeat() {
    if (!scheduleId.value) return
    await queueApi.heartbeat(scheduleId.value)
  }

  async function cancel() {
    if (!scheduleId.value) return
    await queueApi.cancel(scheduleId.value)
    reset()
  }

  function reset() {
    entry.value = null
    status.value = null
    position.value = 0
    estimatedWait.value = 0
    readyToken.value = null
    scheduleId.value = null
  }

  return { entry, status, position, estimatedWait, readyToken, scheduleId, join, poll, heartbeat, cancel, reset }
})
