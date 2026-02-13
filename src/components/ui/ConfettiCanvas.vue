<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()
let animId = 0

interface Particle {
  x: number
  y: number
  w: number
  h: number
  color: string
  vx: number
  vy: number
  rot: number
  rotSpeed: number
  opacity: number
}

onMounted(() => {
  const el = canvas.value
  if (!el) return

  const ctx = el.getContext('2d')!
  el.width = window.innerWidth
  el.height = window.innerHeight

  const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  const particles: Particle[] = []
  const count = 150

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * el.width,
      y: Math.random() * el.height * -1,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    })
  }

  let frame = 0
  function animate() {
    frame++
    ctx.clearRect(0, 0, el!.width, el!.height)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.rot += p.rotSpeed
      if (frame > 120) p.opacity -= 0.008

      ctx.save()
      ctx.globalAlpha = Math.max(0, p.opacity)
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rot * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }

    if (frame < 300 && particles.some((p) => p.opacity > 0)) {
      animId = requestAnimationFrame(animate)
    }
  }

  animId = requestAnimationFrame(animate)

  const onResize = () => {
    el.width = window.innerWidth
    el.height = window.innerHeight
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="fixed inset-0 z-50 pointer-events-none"
  />
</template>
