import { useEffect, useRef, useState } from 'react'

const NAME = 'Zulya'
const GLYPHS = ['♥', '♥', '✦', '❄', '♡']

/* ---------- Снегопад на canvas (3 слоя глубины) ---------- */
function Snow({ boost }) {
  const ref = useRef(null)
  const boostRef = useRef(boost)
  boostRef.current = boost

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    let w, h, raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const flakes = Array.from({ length: 140 }, (_, i) => ({
      layer: i % 3,
      x: Math.random(),
      y: Math.random(),
      p: Math.random() * Math.PI * 2,
    }))
    const resize = () => {
      w = c.width = innerWidth * dpr
      h = c.height = innerHeight * dpr
    }
    resize()
    addEventListener('resize', resize)

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)
      const k = boostRef.current ? 2.6 : 1
      for (const f of flakes) {
        const s = [1.2, 2, 3.2][f.layer] * dpr
        const v = [0.00035, 0.0007, 0.0012][f.layer] * k
        f.y += v
        f.x += Math.sin(t / 1500 + f.p) * 0.0003
        if (f.y > 1.02) { f.y = -0.02; f.x = Math.random() }
        ctx.globalAlpha = [0.4, 0.65, 0.9][f.layer]
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(f.x * w, f.y * h, s, 0, 6.283)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="snow" aria-hidden="true" />
}

/* ---------- Снеговик ---------- */
function Snowman() {
  return (
    <svg className="snowman" viewBox="0 0 300 400" role="img" aria-label="Снеговик с сердечком">
      <defs>
        <radialGradient id="ball" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9d3f2" />
        </radialGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ff8fb0" stopOpacity=".75" />
          <stop offset="1" stopColor="#ff8fb0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="150" cy="384" rx="105" ry="12" fill="#0d0830" opacity=".35" />
      <circle cx="150" cy="300" r="80" fill="url(#ball)" />
      <circle cx="150" cy="200" r="58" fill="url(#ball)" />

      {/* руки-веточки */}
      <g stroke="#5b3a29" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M95 198 Q104 226 126 228" />
        <path d="M205 198 Q196 226 174 228" />
        <path d="M100 214 L84 218 M103 220 L90 232" strokeWidth="3.5" />
        <path d="M200 214 L216 218 M197 220 L210 232" strokeWidth="3.5" />
      </g>

      {/* сердечко */}
      <g transform="translate(150 224)">
        <circle r="46" fill="url(#glow)" className="halo" />
        <path className="heart" d="M0 20 C-44 -8 -24 -40 0 -16 C24 -40 44 -8 0 20Z" fill="#ff5c8a" stroke="#ffc2d1" strokeWidth="2" />
        <path d="M-17 -12 Q-24 -8 -20 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
      </g>

      <circle cx="150" cy="300" r="0" />
      {[270, 305, 340].map((y) => <circle key={y} cx="150" cy={y} r="4" fill="#3b2a52" />)}

      {/* голова */}
      <circle cx="150" cy="125" r="44" fill="url(#ball)" />
      {/* шарфик */}
      <path d="M108 160 Q150 182 192 160 L190 178 Q150 198 110 178Z" fill="#d6336c" />
      <path d="M172 174 L186 214 L166 212 L158 182Z" fill="#b82458" />
      {/* шапка */}
      <ellipse cx="150" cy="95" rx="50" ry="9" fill="#4a2c7a" />
      <path d="M115 95 Q118 50 150 48 Q182 50 185 95Z" fill="#5d3a96" />
      <rect x="116" y="82" width="68" height="10" fill="#ff8fb0" />
      <circle cx="150" cy="46" r="7" fill="#fff" />
      {/* лицо */}
      <g className="eyes" fill="#2a1d47">
        <ellipse cx="135" cy="120" rx="4.5" ry="5.5" />
        <ellipse cx="165" cy="120" rx="4.5" ry="5.5" />
      </g>
      <path d="M150 128 L180 135 L150 140Z" fill="#ff9248" />
      <path d="M137 146 Q150 156 163 146" stroke="#2a1d47" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="122" cy="136" r="8" fill="#ff8fb0" opacity=".55" />
      <circle cx="178" cy="136" r="8" fill="#ff8fb0" opacity=".55" />
    </svg>
  )
}

/* ---------- Приложение ---------- */
export default function App() {
  const [typed, setTyped] = useState(0)
  const [fx, setFx] = useState([])
  const [surprise, setSurprise] = useState(0) // сколько раз нажали
  const [boost, setBoost] = useState(false)
  const id = useRef(0)

  // имя появляется по буквам
  useEffect(() => {
    if (typed >= NAME.length) return
    const t = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 900 : 260)
    return () => clearTimeout(t)
  }, [typed])

  const spawn = (items) => setFx((a) => [...a, ...items])
  const drop = (key) => setFx((a) => a.filter((p) => p.key !== key))

  // сердечки поднимаются от сердца снеговика
  useEffect(() => {
    const t = setInterval(() => {
      spawn([{ key: ++id.current, type: 'rise', g: GLYPHS[(Math.random() * 3) | 0], x: 50 + (Math.random() * 16 - 8), s: 0.8 + Math.random() * 0.9, d: 0 }])
    }, 1400)
    return () => clearInterval(t)
  }, [])

  const burst = (x, y, n = 10) =>
    spawn(Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 90
      return { key: ++id.current, type: 'burst', g: GLYPHS[(Math.random() * GLYPHS.length) | 0], px: x, py: y, dx: Math.cos(a) * r, dy: Math.sin(a) * r - 30, s: 0.7 + Math.random() * 0.9, d: 0 }
    }))

  const onPointerDown = (e) => burst(e.clientX, e.clientY)

  const onSurprise = (e) => {
    e.stopPropagation()
    setSurprise((n) => n + 1)
    setBoost(true)
    setTimeout(() => setBoost(false), 6000)
    spawn(Array.from({ length: 34 }, (_, i) => ({
      key: ++id.current, type: 'rise', g: GLYPHS[(Math.random() * GLYPHS.length) | 0],
      x: 6 + Math.random() * 88, s: 0.8 + Math.random() * 1.2, d: i * 90,
    })))
  }

  return (
    <main className="stage" onPointerDown={onPointerDown}>
      <div className="stars" aria-hidden="true" />
      <Snow boost={boost} />

      <section className="center">
        <p className="kicker">Для тебя,</p>
        <h1 className="name" aria-label={NAME}>
          {NAME.split('').map((ch, i) => (
            <span key={i} className={i < typed ? 'on' : ''}>{ch}</span>
          ))}
        </h1>

        <div className="scene">
          <Snowman />
        </div>

        <p className={'note' + (surprise ? ' show' : '')} aria-live="polite">
          Зимой теплее, когда ты рядом
        </p>

        <button className="btn" onPointerDown={(e) => e.stopPropagation()} onClick={onSurprise}>
          {surprise ? 'Ещё раз' : 'Нажми'}
        </button>
      </section>

      {fx.map((p) =>
        p.type === 'rise' ? (
          <span key={p.key} className="fx rise" onAnimationEnd={() => drop(p.key)}
            style={{ left: p.x + '%', fontSize: 14 * p.s + 'px', animationDelay: p.d + 'ms' }}>{p.g}</span>
        ) : (
          <span key={p.key} className="fx burst" onAnimationEnd={() => drop(p.key)}
            style={{ left: p.px, top: p.py, fontSize: 14 * p.s + 'px', '--dx': p.dx + 'px', '--dy': p.dy + 'px' }}>{p.g}</span>
        )
      )}
    </main>
  )
}
