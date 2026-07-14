import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import logo from '../../assets/BANNERtransparent.png'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authservice'
import { useAuthStore } from '../../store/authstore'

const COLORS = ['#1191B4', '#0E4554', '#3FE1E6']

const loginSchema = z.object({
  credential: z.string().min(6, 'Champ requis'),
  motDePasse: z.string().min(6, 'Mot de passe trop court'),
})

const signupSchema = z.object({
  prenom: z.string().min(2, 'Prénom requis'),
  nom: z.string().min(2, 'Nom requis'),
  credential: z.string().min(6, 'Champ requis'),
  motDePasse: z.string().min(6, 'Mot de passe trop court'),
  cni: z.any(),
  selfie: z.any(),
})

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

// ─── Canvas shapes ───────────────────────────────────────────
const SHAPES = [
  { type: 'cross',    rx: 0.08, ry: 0.10, s: 36, sp: 0.006, ph: 0.0, c: 0 },
  { type: 'pill',     rx: 0.88, ry: 0.08, s: 40, sp: 0.008, ph: 1.0, c: 1 },
  { type: 'molecule', rx: 0.05, ry: 0.50, s: 44, sp: 0.005, ph: 2.0, c: 2 },
  { type: 'capsule',  rx: 0.92, ry: 0.45, s: 38, sp: 0.009, ph: 0.5, c: 0 },
  { type: 'cross',    rx: 0.15, ry: 0.85, s: 30, sp: 0.007, ph: 1.5, c: 1 },
  { type: 'pill',     rx: 0.82, ry: 0.80, s: 34, sp: 0.010, ph: 3.0, c: 2 },
  { type: 'dna',      rx: 0.50, ry: 0.06, s: 40, sp: 0.006, ph: 0.8, c: 0 },
  { type: 'molecule', rx: 0.50, ry: 0.92, s: 36, sp: 0.008, ph: 2.2, c: 1 },
  { type: 'capsule',  rx: 0.92, ry: 0.20, s: 32, sp: 0.007, ph: 1.2, c: 2 },
  { type: 'cross',    rx: 0.05, ry: 0.30, s: 28, sp: 0.009, ph: 3.5, c: 0 },
]

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-s / 2, 0); ctx.lineTo(s / 2, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -s / 2); ctx.lineTo(0, s / 2); ctx.stroke()
  ctx.restore()
}

function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  const w = s * 0.9, h = s * 0.42, r = h / 2
  ctx.beginPath()
  ctx.moveTo(-w / 2 + r, -h / 2); ctx.lineTo(w / 2 - r, -h / 2)
  ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2)
  ctx.lineTo(-w / 2 + r, h / 2)
  ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, 3 * Math.PI / 2)
  ctx.closePath(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke()
  ctx.restore()
}

function drawCapsule(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 4)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  const w = s * 0.5, h = s, r = w / 2
  ctx.beginPath()
  ctx.moveTo(-r, -h / 2 + r); ctx.arc(0, -h / 2 + r, r, Math.PI, 0)
  ctx.lineTo(r, h / 2 - r); ctx.arc(0, h / 2 - r, r, 0, Math.PI)
  ctx.closePath(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke()
  ctx.restore()
}

function drawMolecule(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle * 0.3)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  const pts = [{ x: 0, y: 0 }, { x: s * 0.6, y: -s * 0.4 }, { x: -s * 0.5, y: -s * 0.5 }, { x: s * 0.3, y: s * 0.6 }, { x: -s * 0.4, y: s * 0.4 }]
  const links = [[0, 1], [0, 2], [0, 3], [1, 3], [2, 4], [3, 4]]
  links.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke() })
  pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(p.x, p.y, i === 0 ? s * 0.12 : s * 0.08, 0, Math.PI * 2); ctx.stroke() })
  ctx.restore()
}

function drawDNA(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number, color: string) {
  ctx.save(); ctx.translate(x, y)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  for (let i = -3; i <= 3; i++) {
    const py = i * (s / 3)
    const px = Math.sin(angle + i * 0.8) * s * 0.4
    if (i > -3) {
      const py2 = (i - 1) * (s / 3)
      const px2 = Math.sin(angle + (i - 1) * 0.8) * s * 0.4
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px2, py2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(-px, py); ctx.lineTo(-px2, py2); ctx.stroke()
    }
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(-px, py); ctx.stroke()
    ctx.beginPath(); ctx.arc(px, py, s * 0.07, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(-px, py, s * 0.07, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.restore()
}

// ─── Background Canvas ────────────────────────────────────────
function HealthCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let animId: number
    let t = 0

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function animate() {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)
      t += 0.016
      SHAPES.forEach(sh => {
        const x = sh.rx * W
        const y = sh.ry * H + Math.sin(t * sh.sp * 60 + sh.ph) * 12
        const angle = t * sh.sp * 60 + sh.ph
        const color = COLORS[sh.c]
        ctx.globalAlpha = 0.18
        if (sh.type === 'cross')    drawCross(ctx, x, y, sh.s, angle * 0.1, color)
        if (sh.type === 'pill')     drawPill(ctx, x, y, sh.s, angle * 0.15, color)
        if (sh.type === 'capsule')  drawCapsule(ctx, x, y, sh.s, angle * 0.12, color)
        if (sh.type === 'molecule') drawMolecule(ctx, x, y, sh.s, angle, color)
        if (sh.type === 'dna')      drawDNA(ctx, x, y, sh.s, angle, color)
        ctx.globalAlpha = 1
      })
      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// ─── Composants UI ────────────────────────────────────────────
function Field({ label, type, placeholder, register, error }: {
  label: string; type: string; placeholder: string; register: any; error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 tracking-widest uppercase"
        style={{ color: '#0E4554' }}>{label}</label>
      <input
        {...register} type={type} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(17,145,180,0.25)', color: '#0E4554' }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#E24B4A' }}>{error}</p>}
    </div>
  )
}

function ToggleInput({ mode, onChange, register, error }: {
  mode: 'tel' | 'email'; onChange: (m: 'tel' | 'email') => void; register: any; error?: string
}) {
  return (
    <div>
      <div className="flex justify-center mb-3">
        <div className="flex rounded-lg p-0.5 gap-0.5"
          style={{ background: 'rgba(14,69,84,0.08)' }}>
          {(['tel', 'email'] as const).map(m => (
            <button key={m} type="button" onClick={() => onChange(m)}
              className="px-4 py-1.5 text-xs font-medium rounded-md transition-all"
              style={mode === m
                ? { background: '#1191B4', color: '#fff' }
                : { color: '#0E4554', opacity: 0.5 }}>
              {m === 'tel' ? 'Téléphone' : 'Email'}
            </button>
          ))}
        </div>
      </div>
      <input
        {...register}
        type={mode === 'tel' ? 'tel' : 'email'}
        placeholder={mode === 'tel' ? '77 000 00 00' : 'nom@exemple.com'}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(17,145,180,0.25)', color: '#0E4554' }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#E24B4A' }}>{error}</p>}
    </div>
  )
}

function UploadField({ label, icon, register }: {
  label: string; icon: 'id' | 'camera'; register: any
}) {
  return (
    <label className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl cursor-pointer transition-all mb-3"
      style={{ border: '1.5px dashed rgba(17,145,180,0.4)', background: 'rgba(193,234,245,0.3)' }}>
      {icon === 'id'
        ? <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1191B4" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path strokeLinecap="round" d="M13 9h5M13 12h5M13 15h3"/></svg>
        : <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1191B4" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
      }
      <span className="text-xs" style={{ color: '#0E4554', opacity: 0.6 }}>
        {label} — <strong style={{ color: '#1191B4', opacity: 1 }}>Appuyer pour uploader</strong>
      </span>
      <input {...register} type="file" accept="image/*" className="hidden" />
    </label>
  )
}

function PrimaryButton({ label, loading }: { label: string; loading: boolean }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all disabled:opacity-50"
      style={{ background: '#0E4554', color: '#C1EAF5', border: 'none' }}>
      {loading ? 'Chargement...' : label}
    </button>
  )
}

// ─── Page principale ──────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loginMode, setLoginMode] = useState<'tel' | 'email'>('tel')
  const [signupMode, setSignupMode] = useState<'tel' | 'email'>('tel')

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

 const navigate = useNavigate()
const { setAuth } = useAuthStore()

const onLogin = async (data: LoginForm) => {
  try {
    const response = await authService.connecter({
      [loginMode === 'tel' ? 'telephone' : 'email']: data.credential,
      motDePasse: data.motDePasse,
    })
    setAuth(response.token, response.patient)
    navigate('/dashboard')
  } catch (error: any) {
    loginForm.setError('motDePasse', {
      message: error.response?.data?.message || 'Identifiants incorrects'
    })
  }
}

const onSignup = async (data: SignupForm) => {
  try {
    await authService.inscrire({
      nom: data.nom,
      prenom: data.prenom,
      [signupMode === 'tel' ? 'telephone' : 'email']: data.credential,
      motDePasse: data.motDePasse,
    })
    setTab('login')
    alert('Compte créé ! En attente de validation KYC.')
  } catch (error: any) {
    signupForm.setError('credential', {
      message: error.response?.data?.message || 'Erreur lors de l\'inscription'
    })
  }
}

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: '#C1EAF5' }}>

      <HealthCanvas />

      <div className="w-full max-w-sm relative" style={{ zIndex: 2 }}>

        {/* Header */}
        <div className="text-center mb-2">
          <img src={logo} alt="PharmaLink" className="h-50 w-auto mx-auto mb-0" />
          <p className="text-sm mt-0" style={{ color: '#1191B4' }}>Médicaments livrés · 24h/24</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-1.5"
          style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(17,145,180,0.25)', backdropFilter: 'blur(24px)' }}>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(14,69,84,0.08)' }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all"
                style={tab === t
                  ? { background: '#0E4554', color: '#C1EAF5' }
                  : { color: '#0E4554', opacity: 0.5 }}>
                {t === 'login' ? 'Login' : 'Sign up'}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* LOGIN */}
            {tab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="flex flex-col items-center mb-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-content mb-2"
                    style={{ background: 'rgba(17,145,180,0.15)', border: '2px solid rgba(17,145,180,0.3)' }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="rgba(17,145,180,0.8)" strokeWidth="1.5" className="mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#1191B4' }}>Votre profil</span>
                </div>

                <ToggleInput mode={loginMode} onChange={setLoginMode}
                  register={loginForm.register('credential')}
                  error={loginForm.formState.errors.credential?.message} />

                <Field label="Mot de passe" type="password" placeholder="••••••••"
                  register={loginForm.register('motDePasse')}
                  error={loginForm.formState.errors.motDePasse?.message} />

                <div className="text-right">
                  <a href="#" className="text-xs font-medium" style={{ color: '#1191B4' }}>Mot de passe oublié ?</a>
                </div>

                <PrimaryButton label="Se connecter" loading={loginForm.formState.isSubmitting} />

                <p className="text-center text-xs pt-1" style={{ color: '#0E4554', opacity: 0.6 }}>
                  Pas encore de compte ?{' '}
                  <button type="button" onClick={() => setTab('signup')}
                    className="font-semibold" style={{ color: '#1191B4' }}>Sign up</button>
                </p>
              </form>
            )}

            {/* SIGN UP */}
            {tab === 'signup' && (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" type="text" placeholder="Fatou"
                    register={signupForm.register('prenom')}
                    error={signupForm.formState.errors.prenom?.message} />
                  <Field label="Nom" type="text" placeholder="Diallo"
                    register={signupForm.register('nom')}
                    error={signupForm.formState.errors.nom?.message} />
                </div>

                <ToggleInput mode={signupMode} onChange={setSignupMode}
                  register={signupForm.register('credential')}
                  error={signupForm.formState.errors.credential?.message} />

                <Field label="Mot de passe" type="password" placeholder="••••••••"
                  register={signupForm.register('motDePasse')}
                  error={signupForm.formState.errors.motDePasse?.message} />

                <UploadField label="Carte nationale d'identité" icon="id"
                  register={signupForm.register('cni')} />

                <UploadField label="Selfie de vérification" icon="camera"
                  register={signupForm.register('selfie')} />

                <PrimaryButton label="Créer mon compte" loading={signupForm.formState.isSubmitting} />

                <p className="text-center text-xs pt-1" style={{ color: '#0E4554', opacity: 0.6 }}>
                  Déjà un compte ?{' '}
                  <button type="button" onClick={() => setTab('login')}
                    className="font-semibold" style={{ color: '#1191B4' }}>Login</button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}