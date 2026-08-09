import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'

type StatutCommande =
  | 'RECUE'
  | 'ORDONNANCE_VERIFIEE'
  | 'EN_PREPARATION'
  | 'LIVREUR_ASSIGNE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ANNULEE'
  | 'PROBLEME'

interface Commande {
  id: string
  numero: string
  medicament: string
  pharmacie: string
  montant: number
  date: string
  statut: StatutCommande
  surOrdonnance: boolean
  livreur?: string
  delaiEstime?: number
}

const COMMANDES_MOCK: Commande[] = [
  {
    id: '1',
    numero: 'PL-5892',
    medicament: 'Amoxicilline 1g × 2',
    pharmacie: 'Pharmacie Centrale',
    montant: 5300,
    date: "Aujourd'hui, 14h32",
    statut: 'EN_PREPARATION',
    surOrdonnance: true,
    livreur: 'Mamadou',
    delaiEstime: 35,
  },
  {
    id: '2',
    numero: 'PL-5876',
    medicament: 'Paracétamol 500mg × 1',
    pharmacie: 'Pharmacie Fass',
    montant: 2900,
    date: 'Hier, 09h15',
    statut: 'LIVREE',
    surOrdonnance: false,
  },
  {
    id: '3',
    numero: 'PL-5801',
    medicament: 'Metformine 850mg × 1',
    pharmacie: 'Pharmacie Centrale',
    montant: 3700,
    date: '28 juil., 16h00',
    statut: 'LIVREE',
    surOrdonnance: true,
  },
  {
    id: '4',
    numero: 'PL-5743',
    medicament: 'Ibuprofène 400mg × 3',
    pharmacie: 'Pharma HLM',
    montant: 5900,
    date: '25 juil., 11h20',
    statut: 'ANNULEE',
    surOrdonnance: false,
  },
]

const STATUTS_CONFIG = {
  RECUE:                { label: 'Reçue',                    color: '#1191B4', bg: '#E8EFF8' },
  ORDONNANCE_VERIFIEE:  { label: 'Ordonnance vérifiée',      color: '#1191B4', bg: '#E8EFF8' },
  EN_PREPARATION:       { label: 'En préparation',           color: '#B85C00', bg: '#FFF3E0' },
  LIVREUR_ASSIGNE:      { label: 'Livreur assigné',          color: '#B85C00', bg: '#FFF3E0' },
  EN_LIVRAISON:         { label: 'En livraison',             color: '#5B2C6F', bg: '#F3EEF8' },
  LIVREE:               { label: 'Livrée',                   color: '#0F6E56', bg: '#E8F5EE' },
  ANNULEE:              { label: 'Annulée',                  color: '#E24B4A', bg: '#FDECEA' },
  PROBLEME:             { label: 'Problème',                 color: '#E24B4A', bg: '#FDECEA' },
}

const ETAPES_SUIVI = [
  { statut: 'RECUE',               label: 'Commande reçue',               icon: '📥' },
  { statut: 'ORDONNANCE_VERIFIEE', label: 'Ordonnance vérifiée par IA',   icon: '🤖' },
  { statut: 'EN_PREPARATION',      label: 'Préparation par la pharmacie', icon: '⚗️' },
  { statut: 'LIVREUR_ASSIGNE',     label: 'Livreur assigné',              icon: '🛵' },
  { statut: 'EN_LIVRAISON',        label: 'En livraison',                 icon: '🚀' },
  { statut: 'LIVREE',              label: 'Livrée',                       icon: '✅' },
]

const ORDRE_STATUTS = ['RECUE', 'ORDONNANCE_VERIFIEE', 'EN_PREPARATION', 'LIVREUR_ASSIGNE', 'EN_LIVRAISON', 'LIVREE']

function getStatutIndex(statut: StatutCommande) {
  return ORDRE_STATUTS.indexOf(statut)
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.15)', backdropFilter: 'blur(12px)' }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: '#1191B4' }}>{children}</div>
}

// ─── Vue liste ────────────────────────────────────────────────
function ListeCommandes({ onSelect }: { onSelect: (c: Commande) => void }) {
  const [filtre, setFiltre] = useState<'toutes' | 'en-cours' | 'livrees' | 'annulees'>('toutes')

  const filtered = COMMANDES_MOCK.filter(c => {
    if (filtre === 'en-cours') return ['RECUE', 'ORDONNANCE_VERIFIEE', 'EN_PREPARATION', 'LIVREUR_ASSIGNE', 'EN_LIVRAISON'].includes(c.statut)
    if (filtre === 'livrees') return c.statut === 'LIVREE'
    if (filtre === 'annulees') return c.statut === 'ANNULEE'
    return true
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-medium mb-4" style={{ color: '#0E4554' }}>Mes commandes</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'toutes', label: 'Toutes' },
            { key: 'en-cours', label: 'En cours' },
            { key: 'livrees', label: 'Livrées' },
            { key: 'annulees', label: 'Annulées' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltre(key as typeof filtre)}
              className="px-4 py-2 rounded-full text-xs font-medium flex-shrink-0 transition-all"
              style={filtre === key
                ? { background: '#0E4554', color: '#C1EAF5', border: '1px solid #0E4554' }
                : { background: 'rgba(255,255,255,0.6)', color: '#0E4554', border: '1px solid rgba(17,145,180,0.2)' }
              }>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
        {filtered.map(c => {
          const cfg = STATUTS_CONFIG[c.statut]
          const enCours = !['LIVREE', 'ANNULEE'].includes(c.statut)
          return (
            <div key={c.id} onClick={() => onSelect(c)}
              className="rounded-2xl p-4 cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.15)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{c.medicament}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{c.pharmacie}</div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs" style={{ color: '#B4B2A9' }}>#{c.numero} · {c.date}</div>
                  {enCours && c.delaiEstime && (
                    <div className="text-xs font-medium mt-1" style={{ color: '#1191B4' }}>
                      Livraison estimée : ~{c.delaiEstime} min
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium" style={{ color: '#0E4554' }}>
                  {c.montant.toLocaleString()} FCFA
                </div>
              </div>

              {enCours && (
                <div className="mt-3 h-1 rounded-full" style={{ background: 'rgba(14,69,84,0.1)' }}>
                  <div className="h-1 rounded-full transition-all"
                    style={{
                      background: '#1191B4',
                      width: `${((getStatutIndex(c.statut) + 1) / ORDRE_STATUTS.length) * 100}%`
                    }} />
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-sm font-medium mb-1" style={{ color: '#0E4554' }}>Aucune commande</div>
            <div className="text-xs" style={{ color: '#B4B2A9' }}>Vos commandes apparaîtront ici</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vue détail/suivi ─────────────────────────────────────────
function SuiviCommande({ commande, onBack }: { commande: Commande; onBack: () => void }) {
  const cfg = STATUTS_CONFIG[commande.statut]
  const currentIndex = getStatutIndex(commande.statut)
  const enCours = !['LIVREE', 'ANNULEE', 'PROBLEME'].includes(commande.statut)

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={onBack} className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.2)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0E4554" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
          </svg>
        </button>
        <div>
          <div className="font-medium" style={{ color: '#0E4554' }}>Commande #{commande.numero}</div>
          <div className="text-xs" style={{ color: '#1191B4' }}>{commande.date}</div>
        </div>
      </div>

      {/* Statut actuel */}
      <div className="rounded-2xl p-4 mb-4 flex items-center justify-between"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
        <div>
          <div className="text-xs font-medium mb-0.5 tracking-widest uppercase" style={{ color: cfg.color }}>
            Statut actuel
          </div>
          <div className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</div>
        </div>
        {enCours && commande.delaiEstime && (
          <div className="text-right">
            <div className="text-xs" style={{ color: cfg.color }}>Livraison dans</div>
            <div className="text-xl font-medium" style={{ color: cfg.color }}>~{commande.delaiEstime} min</div>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      {enCours && (
        <div className="mb-4">
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(14,69,84,0.1)' }}>
            <div className="h-1.5 rounded-full transition-all"
              style={{ background: '#1191B4', width: `${((currentIndex + 1) / ORDRE_STATUTS.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Étapes suivi */}
      <Glass className="mb-4">
        <SectionLabel>Suivi en temps réel</SectionLabel>
        {ETAPES_SUIVI.filter(e => commande.surOrdonnance || e.statut !== 'ORDONNANCE_VERIFIEE').map((etape, i) => {
          const etapeIndex = ORDRE_STATUTS.indexOf(etape.statut)
          const done = currentIndex >= etapeIndex
          const active = currentIndex === etapeIndex

          return (
            <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                style={{
                  background: done ? '#E8F5EE' : active ? '#FFF3E0' : 'rgba(14,69,84,0.06)',
                  border: active ? '2px solid #B85C00' : 'none'
                }}>
                {done ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0F6E56" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                ) : (
                  <span style={{ opacity: active ? 1 : 0.3 }}>{etape.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium"
                  style={{ color: done ? '#0F6E56' : active ? '#B85C00' : '#B4B2A9' }}>
                  {etape.label}
                </div>
                {active && commande.livreur && etape.statut === 'LIVREUR_ASSIGNE' && (
                  <div className="text-xs mt-0.5" style={{ color: '#B85C00' }}>
                    {commande.livreur} est en route vers la pharmacie
                  </div>
                )}
                {active && etape.statut === 'EN_LIVRAISON' && commande.livreur && (
                  <div className="text-xs mt-0.5" style={{ color: '#B85C00' }}>
                    {commande.livreur} est en route vers vous
                  </div>
                )}
              </div>
              {active && (
                <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#B85C00' }} />
              )}
            </div>
          )
        })}
      </Glass>

      {/* Infos commande */}
      <Glass className="mb-4">
        <SectionLabel>Détails</SectionLabel>
        <div className="flex justify-between text-sm mb-2" style={{ color: '#0E4554' }}>
          <span>{commande.medicament}</span>
          <span className="font-medium">{(commande.montant - 500).toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-sm mb-2" style={{ color: '#0E4554' }}>
          <span>Livraison</span>
          <span>500 FCFA</span>
        </div>
        <div className="flex justify-between text-sm mb-2" style={{ color: '#0E4554' }}>
          <span>Pharmacie</span>
          <span>{commande.pharmacie}</span>
        </div>
        <div className="flex justify-between pt-3" style={{ borderTop: '0.5px solid rgba(17,145,180,0.15)' }}>
          <span className="font-medium" style={{ color: '#0E4554' }}>Total</span>
          <span className="text-base font-medium" style={{ color: '#0E4554' }}>{commande.montant.toLocaleString()} FCFA</span>
        </div>
      </Glass>

      {/* SMS info */}
      <div className="text-center text-xs pb-4" style={{ color: '#0E4554', opacity: 0.5 }}>
        SMS envoyé à chaque étape de votre commande
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────
export default function CommandesPage() {
    const navigate = useNavigate()
    const { medicamentId } = useParams()
  const [selected, setSelected] = useState<Commande | null>(null)

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: '#C1EAF5' }}>
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        {selected
          ? <SuiviCommande commande={selected} onBack={() => setSelected(null)} />
          : <ListeCommandes onSelect={setSelected} />
        }
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 px-5"
        style={{ background: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(17,145,180,0.12)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        {[
  { id: 'home',       label: 'Accueil',    path: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25', route: '/dashboard' },
  { id: 'commandes',  label: 'Commandes',  path: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z', route: '/commandes' },
  { id: 'pharmacies', label: 'Pharmacies', path: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', route: '/pharmacies' },
  { id: 'sante',      label: 'Santé',      path: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3', route: '/sante' },
  { id: 'profil',     label: 'Profil',     path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', route: '/profil' },
].map(({ id, label, path, route }) => (
  <button key={id} onClick={() => navigate(route)} className="flex flex-col items-center gap-1">
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
      stroke={id === 'commandes' ? '#0E4554' : '#B4B2A9'} strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
    <span className="font-medium" style={{ color: id === 'commandes' ? '#0E4554' : '#B4B2A9', fontSize: 10 }}>{label}</span>
  </button>
))}
      </div>

    </div>
  )
}