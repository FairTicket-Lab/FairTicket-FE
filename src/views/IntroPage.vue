<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Ticket, Shield, Zap, CreditCard, ArrowRight } from 'lucide-vue-next'

const router = useRouter()

// ── Mouse ───────────────────────────────────────────────
const mx = ref(0.5)
const my = ref(0.5)
const px = ref(0)
const py = ref(0)

function onMouse(e: MouseEvent) {
  mx.value = e.clientX / innerWidth
  my.value = e.clientY / innerHeight
  px.value = e.clientX
  py.value = e.clientY
}

const spotStyle = computed(() => ({
  background: `radial-gradient(600px at ${px.value}px ${py.value}px, hsl(265 85% 50% / 0.08), transparent 60%)`,
}))

// Parallax per depth layer (higher = more movement)
function plx(depth: number) {
  return computed(() => ({
    transform: `translate(${(mx.value - 0.5) * depth}px, ${(my.value - 0.5) * depth * 0.7}px)`,
  }))
}
const plxSlow = plx(-15)
const plxMid = plx(20)
const plxFast = plx(-30)

// ── Phase ───────────────────────────────────────────────
const phase = ref(0)
const leaving = ref(false)

function enter() {
  if (leaving.value) return
  leaving.value = true
  setTimeout(() => router.push('/concerts'), 600)
}

// ── Blob parallax ───────────────────────────────────────
const b1 = computed(() => `translate(${(mx.value - 0.5) * 50}px, ${(my.value - 0.5) * 30}px)`)
const b2 = computed(() => `translate(${(mx.value - 0.5) * -40}px, ${(my.value - 0.5) * -25}px)`)
const b3 = computed(() => `translate(${(mx.value - 0.5) * 30}px, ${(my.value - 0.5) * -35}px)`)

// ── Artists ─────────────────────────────────────────────
const artists = [
  { name: '아이유', img: '/images/iu.jpg' },
  { name: 'BLACKPINK', img: '/images/blackpink.jpg' },
  { name: 'BTS', img: '/images/bts.jpg' },
  { name: 'LUCY', img: '/images/Lucy.jpg' },
  { name: 'aespa', img: '/images/aespa.jpg' },
  { name: 'SEVENTEEN', img: '/images/seventeen.png' },
]

// ── Typing ──────────────────────────────────────────────
const typedText = ref('')
const showCursor = ref(true)
const fullText = '모든 팬에게, 공정한 기회를'

function startTyping() {
  let i = 0
  const iv = setInterval(() => {
    if (i < fullText.length) {
      typedText.value = fullText.slice(0, ++i)
    } else {
      clearInterval(iv)
      setTimeout(() => (showCursor.value = false), 1500)
    }
  }, 65)
}

// ── Particles ───────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement>()

interface Dot {
  x: number; y: number; vx: number; vy: number
  r: number; o: number; hue: number; pulse: number; ps: number
}

const LINK = 120
let dots: Dot[] = []
let raf = 0

function initCanvas() {
  const c = canvasRef.value!
  const dpr = devicePixelRatio || 1
  const w = innerWidth, h = innerHeight
  c.width = w * dpr; c.height = h * dpr
  c.style.width = w + 'px'; c.style.height = h + 'px'
  c.getContext('2d')!.scale(dpr, dpr)

  dots = Array.from({ length: 80 }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35, vy: -(Math.random() * 0.4 + 0.1),
    r: Math.random() * 2 + 0.5, o: Math.random() * 0.5 + 0.15,
    hue: 220 + Math.random() * 80,
    pulse: Math.random() * Math.PI * 2, ps: 0.02 + Math.random() * 0.02,
  }))
  tick()
}

function tick() {
  const c = canvasRef.value!
  const ctx = c.getContext('2d')!
  const w = innerWidth, h = innerHeight
  ctx.clearRect(0, 0, w, h)

  for (const d of dots) {
    d.x += d.vx; d.y += d.vy; d.pulse += d.ps
    if (d.y < -10) { d.y = h + 10; d.x = Math.random() * w }
    if (d.x < -10) d.x = w + 10
    if (d.x > w + 10) d.x = -10
    const pf = 0.7 + 0.3 * Math.sin(d.pulse)
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r * pf, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${d.hue},80%,72%,${d.o * pf})`
    ctx.fill()
  }

  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < LINK) {
        ctx.beginPath()
        ctx.moveTo(dots[i].x, dots[i].y)
        ctx.lineTo(dots[j].x, dots[j].y)
        ctx.strokeStyle = `hsla(265,60%,65%,${(1 - dist / LINK) * 0.12})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
  raf = requestAnimationFrame(tick)
}

function onResize() {
  const c = canvasRef.value
  if (!c) return
  const dpr = devicePixelRatio || 1
  c.width = innerWidth * dpr; c.height = innerHeight * dpr
  c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'
  c.getContext('2d')!.scale(dpr, dpr)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') enter()
}

onMounted(() => {
  addEventListener('mousemove', onMouse)
  addEventListener('resize', onResize)
  document.addEventListener('keydown', onKey)
  initCanvas()

  requestAnimationFrame(() => {
    phase.value = 1
    setTimeout(() => (phase.value = 2), 300)
    setTimeout(() => (phase.value = 3), 700)
    setTimeout(() => {
      phase.value = 4
      startTyping()
    }, 1100)
    setTimeout(() => (phase.value = 5), 1600)
    setTimeout(() => (phase.value = 6), 2000)
    setTimeout(() => (phase.value = 7), 2400)
  })
})

onUnmounted(() => {
  removeEventListener('mousemove', onMouse)
  removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onKey)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="intro" :class="{ leaving }">
    <!-- BG layers -->
    <div class="spot" :style="spotStyle" />
    <div class="vignette" />

    <div class="blobs" :class="{ in: phase >= 1 }">
      <div class="bf bf1"><div class="b b1" :style="{ transform: b1 }" /></div>
      <div class="bf bf2"><div class="b b2" :style="{ transform: b2 }" /></div>
      <div class="bf bf3"><div class="b b3" :style="{ transform: b3 }" /></div>
    </div>

    <canvas ref="canvasRef" class="ptcl" />

    <!-- ── Floating decorations ── -->
    <div class="decos" :class="{ in: phase >= 5 }">
      <div class="deco deco-ring" />
      <div class="deco deco-diamond" />
      <div class="deco deco-line1" />
      <div class="deco deco-line2" />
      <div class="deco deco-dot1" />
      <div class="deco deco-dot2" />
    </div>

    <!-- ── Floating feature cards ── -->
    <div class="feat-layer" :class="{ in: phase >= 5 }">
      <div class="feat-float ff1" :style="plxMid.value">
        <div class="feat-card">
          <div class="feat-glow" />
          <div class="feat-icon"><Shield :size="22" :stroke-width="1.5" /></div>
          <div class="feat-text">
            <span class="feat-title">공정한 대기열</span>
            <span class="feat-desc">선착순이 아닌 추첨 기반 시스템</span>
          </div>
        </div>
      </div>
      <div class="feat-float ff2" :style="plxFast.value">
        <div class="feat-card">
          <div class="feat-glow" />
          <div class="feat-icon"><Zap :size="22" :stroke-width="1.5" /></div>
          <div class="feat-text">
            <span class="feat-title">실시간 좌석</span>
            <span class="feat-desc">원하는 좌석을 직접 선택</span>
          </div>
        </div>
      </div>
      <div class="feat-float ff3" :style="plxSlow.value">
        <div class="feat-card">
          <div class="feat-glow" />
          <div class="feat-icon"><CreditCard :size="22" :stroke-width="1.5" /></div>
          <div class="feat-text">
            <span class="feat-title">안전한 결제</span>
            <span class="feat-desc">PortOne 인증 결제</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Center content ── -->
    <div class="center">
      <div class="logo" :class="{ in: phase >= 2 }">
        <div class="pulse-ring r1" /><div class="pulse-ring r2" /><div class="pulse-ring r3" />
        <div class="logo-circle"><Ticket :size="32" :stroke-width="1.5" /></div>
      </div>

      <h1 class="title" :class="{ in: phase >= 3 }">FAIRTICKET</h1>

      <p class="sub" :class="{ in: phase >= 4 }">
        {{ typedText }}<span v-if="showCursor && phase >= 4" class="cursor">|</span>
      </p>

      <button class="cta" :class="{ in: phase >= 7 }" @click="enter">
        <span>지금 시작하기</span>
        <ArrowRight :size="18" />
      </button>
    </div>

    <!-- ── Artist marquee ── -->
    <div class="marquee-wrap" :class="{ in: phase >= 6 }">
      <div class="marquee-track">
        <div v-for="(a, i) in [...artists, ...artists, ...artists]" :key="i" class="marquee-item">
          <img :src="a.img" :alt="a.name" class="marquee-img" />
          <span class="marquee-name">{{ a.name }}</span>
        </div>
      </div>
    </div>

    <!-- ── Ticker ── -->
    <div class="ticker" :class="{ in: phase >= 6 }">
      <div class="ticker-track">
        <span v-for="i in 4" :key="i" class="ticker-seg">
          FAIR QUEUE&ensp;&bull;&ensp;REAL-TIME SEATS&ensp;&bull;&ensp;SECURE
          PAYMENT&ensp;&bull;&ensp;모든 팬에게 공정한
          기회를&ensp;&bull;&ensp;
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ──────────────────────────────────────────────── */
.intro {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #07071a;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: opacity 0.6s, transform 0.6s, filter 0.6s;
}
.intro.leaving { opacity: 0; transform: scale(1.06); filter: blur(10px); }

.spot { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.vignette {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 35%, #07071a 100%);
}
.ptcl { position: absolute; inset: 0; pointer-events: none; z-index: 1; }

/* ── Blobs ────────────────────────────────────────────── */
.blobs { position: absolute; inset: 0; filter: blur(100px); opacity: 0; transition: opacity 1.5s; }
.blobs.in { opacity: 1; }
.bf { position: absolute; }
.bf1 { top: -15%; left: -10%; animation: d1 18s ease-in-out infinite alternate; }
.bf2 { bottom: -10%; right: -8%; animation: d2 22s ease-in-out infinite alternate; }
.bf3 { top: 35%; left: 45%; animation: d3 16s ease-in-out infinite alternate; }
.b { border-radius: 50%; transition: transform 0.2s ease-out; }
.b1 { width: 500px; height: 500px; background: radial-gradient(circle, hsl(265 85% 40%), transparent 70%); }
.b2 { width: 450px; height: 450px; background: radial-gradient(circle, hsl(220 90% 40%), transparent 70%); }
.b3 { width: 350px; height: 350px; background: radial-gradient(circle, hsl(300 70% 35%), transparent 70%); }
@keyframes d1 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.1)} 100%{transform:translate(-20px,30px) scale(1.05)} }
@keyframes d2 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.08)} 100%{transform:translate(40px,-20px) scale(.95)} }
@keyframes d3 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,50px) scale(1.15)} 100%{transform:translate(-40px,-30px) scale(1)} }

/* ── Floating decorations ─────────────────────────────── */
.decos { position: absolute; inset: 0; z-index: 4; pointer-events: none; opacity: 0; transition: opacity 1s 0.3s; }
.decos.in { opacity: 1; }
.deco { position: absolute; }

.deco-ring {
  top: 12%; right: 18%;
  width: 80px; height: 80px;
  border: 1px solid hsl(265 70% 60% / 0.15);
  border-radius: 50%;
  animation: spin-slow 20s linear infinite, float-gentle 6s ease-in-out infinite;
}
.deco-diamond {
  bottom: 22%; left: 12%;
  width: 16px; height: 16px;
  background: hsl(265 85% 60% / 0.12);
  transform: rotate(45deg);
  animation: float-gentle 5s ease-in-out infinite reverse;
}
.deco-line1 {
  top: 30%; left: 8%;
  width: 60px; height: 1px;
  background: linear-gradient(90deg, transparent, hsl(220 80% 60% / 0.2), transparent);
  animation: float-drift 8s ease-in-out infinite;
}
.deco-line2 {
  bottom: 35%; right: 10%;
  width: 40px; height: 1px;
  background: linear-gradient(90deg, transparent, hsl(265 80% 60% / 0.2), transparent);
  transform: rotate(30deg);
  animation: float-drift 7s ease-in-out infinite reverse;
}
.deco-dot1 {
  top: 55%; left: 22%;
  width: 4px; height: 4px; border-radius: 50%;
  background: hsl(265 85% 65% / 0.25);
  animation: float-gentle 4s ease-in-out infinite;
}
.deco-dot2 {
  top: 18%; right: 35%;
  width: 3px; height: 3px; border-radius: 50%;
  background: hsl(220 85% 65% / 0.2);
  animation: float-gentle 5.5s ease-in-out infinite reverse;
}

@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes float-gentle {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes float-drift {
  0%,100% { transform: translate(0,0); opacity: 0.5; }
  50% { transform: translate(15px,-10px); opacity: 1; }
}

/* ── Floating feature cards ───────────────────────────── */
.feat-layer { position: absolute; inset: 0; z-index: 8; pointer-events: none; }
.feat-float {
  position: absolute;
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.15s ease-out;
}
.feat-layer.in .feat-float { opacity: 1; }

.ff1 {
  top: 14%; left: 6%;
  animation: orbit1 10s ease-in-out infinite;
}
.ff2 {
  top: 22%; right: 5%;
  animation: orbit2 12s ease-in-out infinite;
}
.ff3 {
  bottom: 20%; left: 8%;
  animation: orbit3 11s ease-in-out infinite;
}

@keyframes orbit1 {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  25% { transform: translate(12px,-18px) rotate(1.5deg); }
  50% { transform: translate(-8px,-28px) rotate(-1deg); }
  75% { transform: translate(-18px,-8px) rotate(0.5deg); }
}
@keyframes orbit2 {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  33% { transform: translate(-15px,22px) rotate(-1.5deg); }
  66% { transform: translate(18px,-12px) rotate(1deg); }
}
@keyframes orbit3 {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  40% { transform: translate(22px,-14px) rotate(1deg); }
  80% { transform: translate(-12px,18px) rotate(-1deg); }
}

.feat-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 22px;
  border-radius: 16px;
  background: hsl(240 8% 8% / 0.65);
  border: 1px solid hsl(0 0% 100% / 0.06);
  backdrop-filter: blur(12px);
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  min-width: 220px;
}
.feat-card:hover {
  border-color: hsl(265 85% 60% / 0.35);
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 12px 40px hsl(265 85% 50% / 0.15);
}
.feat-glow {
  position: absolute;
  top: -40%; left: -40%;
  width: 180%; height: 180%;
  background: radial-gradient(circle, hsl(265 85% 55% / 0.06), transparent 60%);
  animation: glow-rotate 8s linear infinite;
  pointer-events: none;
}
@keyframes glow-rotate { to { transform: rotate(360deg); } }

.feat-icon {
  flex-shrink: 0;
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: hsl(265 85% 55% / 0.15);
  color: hsl(265 70% 70%);
}
.feat-text { display: flex; flex-direction: column; gap: 4px; }
.feat-title { font-size: 0.88rem; font-weight: 600; color: hsl(0 0% 90%); }
.feat-desc { font-size: 0.72rem; color: hsl(0 0% 48%); line-height: 1.4; }

/* ── Center content ───────────────────────────────────── */
.center {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 0 24px;
}

/* Logo */
.logo {
  position: relative;
  margin-bottom: 28px;
  opacity: 0; transform: scale(0.5) translateY(10px);
  transition: all 0.7s cubic-bezier(0.16,1,0.3,1);
}
.logo.in { opacity: 1; transform: scale(1) translateY(0); }

.logo-circle {
  position: relative; z-index: 2;
  width: 76px; height: 76px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, hsl(265 85% 55%), hsl(290 80% 50%));
  color: white;
  box-shadow: 0 0 40px hsl(265 85% 50% / 0.35), 0 0 80px hsl(265 85% 50% / 0.15);
}
.pulse-ring {
  position: absolute; top: 50%; left: 50%;
  width: 76px; height: 76px; border-radius: 50%;
  border: 1px solid hsl(265 85% 60% / 0.4);
  transform: translate(-50%,-50%) scale(1); opacity: 0;
}
.logo.in .pulse-ring { animation: ring-expand 3s ease-out infinite; }
.r1 { animation-delay: 0s !important; }
.r2 { animation-delay: 1s !important; }
.r3 { animation-delay: 2s !important; }
@keyframes ring-expand {
  0% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%,-50%) scale(3.5); opacity: 0; }
}

/* Title */
.title {
  font-family: 'Space Grotesk','Inter',system-ui,sans-serif;
  font-size: clamp(3rem,10vw,7rem);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1;
  margin: 0 0 20px;
  background: linear-gradient(135deg,#c084fc 0%,#818cf8 25%,#67e8f9 50%,#818cf8 75%,#c084fc 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  clip-path: inset(0 50% 0 50%);
  transition: clip-path 0.8s cubic-bezier(0.16,1,0.3,1);
}
.title.in { clip-path: inset(0 0% 0 0%); animation: grad-shift 4s ease-in-out infinite; }
@keyframes grad-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

/* Subtitle */
.sub {
  font-size: clamp(1rem,2.5vw,1.35rem);
  color: hsl(0 0% 65%); font-weight: 400; letter-spacing: 0.04em;
  margin: 0 0 40px; min-height: 1.6em;
  opacity: 0; transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
}
.sub.in { opacity: 1; transform: translateY(0); }

.cursor {
  color: hsl(265 85% 60%); font-weight: 300;
  animation: blink 0.7s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* CTA */
.cta {
  position: relative;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 42px; border-radius: 50px; border: none;
  background: linear-gradient(135deg, hsl(265 85% 55%), hsl(280 80% 50%));
  color: white; font-size: 1.05rem; font-weight: 600;
  cursor: pointer; overflow: hidden;
  box-shadow: 0 4px 30px hsl(265 85% 50% / 0.3);
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s;
}
.cta.in { opacity: 1; transform: translateY(0); animation: cta-glow 3s ease-in-out 2.5s infinite; }
.cta:hover { box-shadow: 0 6px 45px hsl(265 85% 50% / 0.5); transform: translateY(-3px) scale(1.03); }
.cta:active { transform: scale(0.97); }
.cta::after {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s;
}
.cta:hover::after { left: 100%; }
@keyframes cta-glow { 0%,100%{box-shadow:0 4px 30px hsl(265 85% 50%/.3)} 50%{box-shadow:0 4px 50px hsl(265 85% 50%/.5)} }

/* ── Artist marquee ───────────────────────────────────── */
.marquee-wrap {
  position: absolute;
  bottom: 56px; left: 0; right: 0;
  z-index: 10; overflow: hidden;
  opacity: 0; transform: translateY(10px);
  transition: all 0.8s cubic-bezier(0.16,1,0.3,1);
}
.marquee-wrap.in { opacity: 1; transform: translateY(0); }

.marquee-track {
  display: flex; gap: 32px;
  animation: marquee 25s linear infinite;
  width: max-content;
}
.marquee-item {
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
}
.marquee-img {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid hsl(265 70% 55% / 0.3);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.marquee-item:hover .marquee-img {
  border-color: hsl(265 70% 60% / 0.7);
  box-shadow: 0 0 16px hsl(265 85% 50% / 0.3);
}
.marquee-name {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
  color: hsl(0 0% 45%);
  white-space: nowrap;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% / 3)); }
}

/* ── Ticker ───────────────────────────────────────────── */
.ticker {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px 0; z-index: 10;
  background: hsl(240 8% 6% / 0.6);
  backdrop-filter: blur(10px);
  border-top: 1px solid hsl(0 0% 100% / 0.05);
  overflow: hidden; opacity: 0;
  transition: opacity 0.8s ease 0.3s;
}
.ticker.in { opacity: 1; }
.ticker-track { display: flex; white-space: nowrap; animation: tick-scroll 40s linear infinite; }
.ticker-seg { color: hsl(0 0% 35%); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; }
@keyframes tick-scroll { from{transform:translateX(0)} to{transform:translateX(-25%)} }

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 768px) {
  .feat-layer { display: none; }

  .center::after {
    content: '';
    display: block;
    margin-top: 24px;
  }

  .deco-ring, .deco-line1, .deco-line2 { display: none; }

  .marquee-wrap { bottom: 50px; }
}

@media (max-width: 640px) {
  .logo-circle { width: 64px; height: 64px; }
  .logo-circle svg { width: 26px; height: 26px; }
  .pulse-ring { width: 64px; height: 64px; }
  .cta { padding: 14px 32px; font-size: 0.95rem; }
}
</style>
