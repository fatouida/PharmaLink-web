import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/authstore'
import logo from '../../assets/LOGO.png'
import { useNavigate } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}
import AppLayout from '../../components/AppLayout'

const COLORS = ['#1191B4', '#0E4554', '#3FE1E6']
const SHAPES = [
  { type: 'cross',    rx: .05, ry: .10, s: 24, sp: .006, ph: 0.0, c: 0 },
  { type: 'pill',     rx: .90, ry: .08, s: 28, sp: .008, ph: 1.0, c: 1 },
  { type: 'molecule', rx: .88, ry: .50, s: 32, sp: .005, ph: 2.0, c: 2 },
  { type: 'cross',    rx: .06, ry: .60, s: 20, sp: .007, ph: 1.5, c: 1 },
  { type: 'dna',      rx: .92, ry: .80, s: 30, sp: .006, ph: 0.8, c: 0 },
]

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a)
  ctx.strokeStyle = color; ctx.lineWidth = s * .2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-s/2, 0); ctx.lineTo(s/2, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -s/2); ctx.lineTo(0, s/2); ctx.stroke()
  ctx.restore()
}
function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  const w = s*.9, h = s*.4, r = h/2
  ctx.beginPath()
  ctx.moveTo(-w/2+r, -h/2); ctx.lineTo(w/2-r, -h/2)
  ctx.arc(w/2-r, 0, r, -Math.PI/2, Math.PI/2)
  ctx.lineTo(-w/2+r, h/2); ctx.arc(-w/2+r, 0, r, Math.PI/2, 3*Math.PI/2)
  ctx.closePath(); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -h/2); ctx.lineTo(0, h/2); ctx.stroke()
  ctx.restore()
}
function drawMolecule(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a * .3)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  const pts = [{x:0,y:0},{x:s*.6,y:-s*.4},{x:-s*.5,y:-s*.5},{x:s*.3,y:s*.6}]
  const links = [[0,1],[0,2],[0,3],[1,3]]
  links.forEach(([a,b]) => { ctx.beginPath(); ctx.moveTo(pts[a].x,pts[a].y); ctx.lineTo(pts[b].x,pts[b].y); ctx.stroke() })
  pts.forEach((p,i) => { ctx.beginPath(); ctx.arc(p.x,p.y,i===0?s*.1:s*.07,0,Math.PI*2); ctx.stroke() })
  ctx.restore()
}
function drawDNA(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, a: number, color: string) {
  ctx.save(); ctx.translate(x, y)
  ctx.strokeStyle = color; ctx.lineWidth = 1.5
  for (let i = -2; i <= 2; i++) {
    const py = i * (s/2.5)
    const px = Math.sin(a + i*.8) * s*.35
    if (i > -2) {
      const py2 = (i-1)*(s/2.5), px2 = Math.sin(a+(i-1)*.8)*s*.35
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px2,py2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(-px,py); ctx.lineTo(-px2,py2); ctx.stroke()
    }
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(-px,py); ctx.stroke()
    ctx.beginPath(); ctx.arc(px,py,s*.06,0,Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.arc(-px,py,s*.06,0,Math.PI*2); ctx.stroke()
  }
  ctx.restore()
}

function HealthCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let animId: number, t = 0
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    function animate() {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)
      t += .016
      SHAPES.forEach(sh => {
        const x = sh.rx * W
        const y = sh.ry * H + Math.sin(t * sh.sp * 60 + sh.ph) * 10
        const angle = t * sh.sp * 60 + sh.ph
        ctx.globalAlpha = .12
        if (sh.type === 'cross')    drawCross(ctx, x, y, sh.s, angle*.1, COLORS[sh.c])
        if (sh.type === 'pill')     drawPill(ctx, x, y, sh.s, angle*.15, COLORS[sh.c])
        if (sh.type === 'molecule') drawMolecule(ctx, x, y, sh.s, angle, COLORS[sh.c])
        if (sh.type === 'dna')      drawDNA(ctx, x, y, sh.s, angle, COLORS[sh.c])
        ctx.globalAlpha = 1
      })
      animId = requestAnimationFrame(animate)
    }
    resize(); animate()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
}

const COMMANDES_MOCK = [
  { id: 1, nom: 'Paracétamol 500mg', pharmacie: 'Pharmacie Centrale', temps: 'Il y a 2h', statut: 'EN_PREPARATION' },
  { id: 2, nom: 'Amoxicilline 1g',   pharmacie: 'Pharmacie Fass',     temps: 'Hier',      statut: 'LIVREE' },
]

const PHARMACIES_MOCK = [
  { id: 1, initiales: 'PC', nom: 'Pharmacie Centrale',  adresse: '14 Rue Carnot',      distance: '350m',  garde: true },
  { id: 2, initiales: 'PF', nom: 'Pharmacie Fass',      adresse: 'Av. Bourguiba',      distance: '600m',  garde: true },
  { id: 3, initiales: 'HL', nom: 'Pharma HLM',          adresse: 'Route de Rufisque',  distance: '1.2km', garde: false },
]

const LIVRAISON_MOCK = {
  id: 'PL-4921',
  pharmacie: 'Pharmacie de la Nation',
  progress: 72,
  timer: '12:45',
  sub: 'Livreur à 5 min · Code SMS envoyé',
}

const RAPPELS_MOCK = [
  { nom: 'Paracétamol 500mg', heure: '08:00', actif: true },
  { nom: 'Amoxicilline 1g',   heure: '12:00', actif: false },
]

function StatusBadge({ statut }: { statut: string }) {
  if (statut === 'EN_PREPARATION')
    return <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#FFF3E0', color: '#B85C00' }}>En préparation</span>
  if (statut === 'LIVREE')
    return <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8F5EE', color: '#0F6E56' }}>Livrée</span>
  if (statut === 'EN_LIVRAISON')
    return <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8EFF8', color: '#0E4554' }}>En livraison</span>
  return null
}

export default function DashboardPage() {
  const { patient } = useAuthStore()
  const [activeNav, setActiveNav] = useState('home')
  const [showRappel, setShowRappel] = useState(false)
  const navigate = useNavigate()

  const glass = {
    background: 'rgba(255,255,255,0.55)',
    border: '1px solid rgba(17,145,180,0.15)',
    backdropFilter: 'blur(12px)',
  }

  return (
    <AppLayout>
  <div className="min-h-screen ..." style={{ background: '#C1EAF5' }}>
      <HealthCanvas />

      <div className="relative pb-20" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src={logo} alt="PharmaLink" className="h-20 w-auto" />
            </div>
            <div>
              <div className="text-xs" style={{ color: '#1191B4' }}>Bonjour,</div>
              <div className="font-medium text-base" style={{ color: '#0E4554' }}>
                {patient?.prenom} {patient?.nom}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1D9E75' }} />
                <span className="text-xs font-medium" style={{ color: '#0F6E56' }}>Identité vérifiée (KYC)</span>
              </div>
            </div>
    
        </div>

          <button
            onClick={() => setShowRappel(true)}
            className="flex items-center justify-center rounded-full relative"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.2)' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0E4554" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#E24B4A', border: '1.5px solid #C1EAF5' }} />
          </button>
        </div>

        {/* Search */}
<div className="px-5 mb-4" onClick={() => navigate('/commande')} style={{ cursor: 'pointer' }}>
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
    style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(17,145,180,0.2)', backdropFilter: 'blur(12px)' }}>
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B4B2A9" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
    </svg>
    <span className="text-sm" style={{ color: '#B4B2A9' }}>Rechercher un médicament...</span>
  </div>
</div>

        {/* Livraison en cours */}
        <div className="mx-5 mb-5 rounded-2xl p-4 relative overflow-hidden" style={{ background: '#0E4554' }}>
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: 'rgba(63,225,230,0.1)' }} />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#3FE1E6' }} />
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#3FE1E6' }}>Livraison en cours</span>
            </div>
            <span className="text-xs" style={{ color: 'rgba(193,234,245,0.5)' }}>ID: #{LIVRAISON_MOCK.id}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: '#C1EAF5' }}>{LIVRAISON_MOCK.pharmacie}</span>
            <span className="text-xl font-medium" style={{ color: '#3FE1E6' }}>{LIVRAISON_MOCK.timer}</span>
          </div>
          <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="h-1 rounded-full" style={{ background: '#3FE1E6', width: `${LIVRAISON_MOCK.progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'rgba(193,234,245,0.5)' }}>{LIVRAISON_MOCK.sub}</span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C1EAF5" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex justify-around px-5 mb-6">
          {[
            { label: 'Urgence',    bg: 'rgba(234,193,193,0.5)', border: 'rgba(226,75,74,0.2)',  color: '#A32D2D', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
            { label: 'Ordonnance', bg: 'rgba(193,220,245,0.5)', border: 'rgba(17,145,180,0.2)', color: '#0E4554', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
            { label: 'Garde',      bg: 'rgba(193,234,220,0.5)', border: 'rgba(29,158,117,0.2)', color: '#0F6E56', icon: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' },
            { label: 'Carte',      bg: 'rgba(220,193,234,0.5)', border: 'rgba(91,44,111,0.2)',  color: '#5B2C6F', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
          ].map(({ label, bg, border, color, icon }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(10px)' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <span className="font-medium uppercase tracking-wide" style={{ color: '#0E4554', fontSize: 10 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Pharmacies proches */}
        <div className="flex items-center justify-between px-5 mb-3">
          <span className="font-medium" style={{ color: '#0E4554' }}>Pharmacies les plus proches</span>
          <span className="text-xs font-medium" style={{ color: '#1191B4' }}>Voir plus</span>
        </div>
        <div className="px-5 flex flex-col gap-2 mb-6">
          {PHARMACIES_MOCK.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={glass}>
              <div className="flex items-center justify-center rounded-xl text-xs font-medium flex-shrink-0"
                style={{ width: 42, height: 42, background: '#0E4554', color: '#C1EAF5' }}>
                {p.initiales}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{p.nom}</div>
                <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{p.adresse} · {p.distance}</div>
              </div>
              {p.garde && (
                <span className="text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: '#FFF3E0', color: '#B85C00' }}>De garde</span>
              )}
            </div>
          ))}
        </div>

        {/* Commandes récentes */}
        <div className="flex items-center justify-between px-5 mb-3">
          <span className="font-medium" style={{ color: '#0E4554' }}>Commandes récentes</span>
          <span className="text-xs font-medium" style={{ color: '#1191B4' }}>Voir tout</span>
        </div>
        <div className="px-5 flex flex-col gap-2">
          {COMMANDES_MOCK.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={glass}>
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 40, height: 40, background: '#E8EFF8' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1191B4" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{c.nom}</div>
                <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{c.pharmacie} · {c.temps}</div>
              </div>
              <StatusBadge statut={c.statut} />
            </div>
          ))}
        </div>

      </div>

      {/* Modale Rappels */}
      {showRappel && (
        <div className="fixed inset-0 flex items-end justify-center pb-24"
          style={{ zIndex: 20, background: 'rgba(14,69,84,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 mx-4"
            style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(17,145,180,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-medium text-base" style={{ color: '#0E4554' }}>Rappels médicaments</span>
              <button onClick={() => setShowRappel(false)}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#B4B2A9" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {RAPPELS_MOCK.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-3"
                style={{ borderBottom: i < RAPPELS_MOCK.length - 1 ? '1px solid rgba(17,145,180,0.1)' : 'none' }}>
                <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ width: 40, height: 40, background: '#E8EFF8' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1191B4" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{r.nom}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>Rappel à {r.heure}</div>
                </div>
                <div className="w-11 h-6 rounded-full cursor-pointer relative flex-shrink-0"
                  style={{ background: r.actif ? '#0E4554' : '#D3D1C7' }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
                    style={{ background: '#fff', left: r.actif ? '24px' : '4px' }} />
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-2xl text-sm font-medium mt-4"
              style={{ background: '#0E4554', color: '#C1EAF5' }}>
              Ajouter un rappel
            </button>
          </div>
        </div>
      )}

    {/* Bottom Nav */}
    <div
  className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center px-2 py-3"
  style={{ background: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(17,145,180,0.12)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        {[
          { id: 'home',       label: 'Accueil',    path: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
          { id: 'commandes',  label: 'Commandes',  path: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
          { id: 'pharmacies', label: 'Pharmacies', path: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
          { id: 'sante',      label: 'Santé',      path: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3' },
          { id: 'profil',     label: 'Profil',     path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
        ].map(({ id, label, path }) => (
          <button key={id} onClick={() => {
            setActiveNav(id)
            if (id === 'commandes') navigate('/commandes')
            if (id === 'sante') navigate('/sante')
            if (id === 'pharmacies') navigate('/pharmacies')
            if (id === 'profil') navigate('/profil')
          }} className="flex flex-col items-center gap-1">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke={activeNav === id ? '#0E4554' : '#B4B2A9'} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
            <span className="font-medium" style={{ color: activeNav === id ? '#0E4554' : '#B4B2A9', fontSize: 10 }}>{label}</span>
 </button>
        ))}
      </div>
    </div>
  </AppLayout>
  )
}