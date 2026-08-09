import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Medicament {
  id: number
  nom: string
  dosage: string
  frequence: string
  rappel: boolean
  heureRappel?: string
  stock: number
  prochainRenouvellement?: string
}

interface Ordonnance {
  id: number
  medecin: string
  date: string
  medicaments: string[]
  statut: 'active' | 'expiree' | 'utilisee'
}

const MEDICAMENTS_MOCK: Medicament[] = [
  { id: 1, nom: 'Metformine 850mg', dosage: '850mg', frequence: '2x par jour', rappel: true, heureRappel: '08:00', stock: 14, prochainRenouvellement: 'Dans 7 jours' },
  { id: 2, nom: 'Amlodipine 5mg', dosage: '5mg', frequence: '1x par jour', rappel: true, heureRappel: '09:00', stock: 28, prochainRenouvellement: 'Dans 14 jours' },
  { id: 3, nom: 'Paracétamol 500mg', dosage: '500mg', frequence: 'Si besoin', rappel: false, stock: 6 },
]

const ORDONNANCES_MOCK: Ordonnance[] = [
  { id: 1, medecin: 'Dr Moussa Seck', date: '15 juil. 2026', medicaments: ['Metformine 850mg', 'Amlodipine 5mg'], statut: 'active' },
  { id: 2, medecin: 'Dr Aminata Diallo', date: '10 juin 2026', medicaments: ['Amoxicilline 1g'], statut: 'utilisee' },
  { id: 3, medecin: 'Dr Moussa Seck', date: '12 jan. 2026', medicaments: ['Metformine 850mg'], statut: 'expiree' },
]

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

export default function SantePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'medicaments' | 'ordonnances' | 'rappels'>('medicaments')
  const [rappels, setRappels] = useState<Record<number, boolean>>(
    Object.fromEntries(MEDICAMENTS_MOCK.map(m => [m.id, m.rappel]))
  )

  const toggleRappel = (id: number) => {
    setRappels(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden pb-20" style={{ background: '#C1EAF5' }}>
      <div className="flex-1 flex flex-col p-5 overflow-hidden">

        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-xl font-medium mb-1" style={{ color: '#0E4554' }}>Ma santé</h1>
          <p className="text-xs" style={{ color: '#1191B4' }}>Médicaments, ordonnances et rappels</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-4 flex-shrink-0"
          style={{ background: 'rgba(14,69,84,0.08)' }}>
          {([
            { key: 'medicaments', label: 'Médicaments' },
            { key: 'ordonnances', label: 'Ordonnances' },
            { key: 'rappels',     label: 'Rappels' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-1 py-2 text-xs font-medium rounded-xl transition-all"
              style={activeTab === key
                ? { background: '#0E4554', color: '#C1EAF5' }
                : { color: '#0E4554', opacity: 0.5 }
              }>
              {label}
            </button>
          ))}
        </div>

        {/* MEDICAMENTS */}
        {activeTab === 'medicaments' && (
          <div className="flex flex-col gap-3 overflow-y-auto flex-1">
            {MEDICAMENTS_MOCK.map(med => (
              <Glass key={med.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{med.nom}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{med.dosage} · {med.frequence}</div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg"
                    style={{ background: med.stock <= 7 ? '#FDECEA' : '#E8F5EE', color: med.stock <= 7 ? '#E24B4A' : '#0F6E56' }}>
                    {med.stock} restantes
                  </span>
                </div>

                {med.prochainRenouvellement && (
                  <div className="text-xs mb-3 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(17,145,180,0.08)', color: '#1191B4' }}>
                    Renouvellement : {med.prochainRenouvellement}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/commande/${med.id}`)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium"
                    style={{ background: '#0E4554', color: '#C1EAF5' }}>
                    Commander
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(17,145,180,0.1)', color: '#1191B4' }}>
                    Voir détails
                  </button>
                </div>
              </Glass>
            ))}

            <button className="w-full py-3 rounded-2xl text-sm font-medium mt-2"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px dashed rgba(17,145,180,0.3)', color: '#1191B4' }}>
              + Ajouter un médicament
            </button>
          </div>
        )}

        {/* ORDONNANCES */}
        {activeTab === 'ordonnances' && (
          <div className="flex flex-col gap-3 overflow-y-auto flex-1">
            {ORDONNANCES_MOCK.map(ordo => {
              const cfg = {
                active:   { label: 'Active',   color: '#0F6E56', bg: '#E8F5EE' },
                utilisee: { label: 'Utilisée', color: '#1191B4', bg: '#E8EFF8' },
                expiree:  { label: 'Expirée',  color: '#E24B4A', bg: '#FDECEA' },
              }[ordo.statut]

              return (
                <Glass key={ordo.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{ordo.medecin}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{ordo.date}</div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-lg"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {ordo.medicaments.map((m, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(17,145,180,0.08)', color: '#0E4554' }}>
                        {m}
                      </span>
                    ))}
                  </div>

                  {ordo.statut === 'active' && (
                    <button
                      onClick={() => navigate(`/commande/${ordo.id}`)}
                      className="w-full py-2 rounded-xl text-xs font-medium"
                      style={{ background: '#0E4554', color: '#C1EAF5' }}>
                      Commander avec cette ordonnance
                    </button>
                  )}
                </Glass>
              )
            })}

            <button className="w-full py-3 rounded-2xl text-sm font-medium mt-2"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px dashed rgba(17,145,180,0.3)', color: '#1191B4' }}>
              + Uploader une ordonnance
            </button>
          </div>
        )}

        {/* RAPPELS */}
        {activeTab === 'rappels' && (
          <div className="flex flex-col gap-3 overflow-y-auto flex-1">
           <div className="mb-2 rounded-2xl p-4" style={{ background: 'rgba(14,69,84,0.06)', border: '1px solid rgba(17,145,180,0.15)' }}>
              <div className="text-xs" style={{ color: '#0E4554', opacity: 0.7 }}>
                Les rappels vous envoient une notification SMS et push à l'heure définie pour ne pas oublier vos médicaments.
              </div>
            </div>

            {MEDICAMENTS_MOCK.map(med => (
              <Glass key={med.id}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{med.nom}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>
                      {rappels[med.id] ? `Rappel à ${med.heureRappel || '08:00'}` : 'Rappel désactivé'}
                    </div>
                  </div>
                  <div
                    onClick={() => toggleRappel(med.id)}
                    className="w-12 h-6 rounded-full cursor-pointer relative transition-all flex-shrink-0"
                    style={{ background: rappels[med.id] ? '#0E4554' : '#D3D1C7' }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
                      style={{ background: '#fff', left: rappels[med.id] ? '28px' : '4px' }} />
                  </div>
                </div>
              </Glass>
            ))}

            <button className="w-full py-3 rounded-2xl text-sm font-medium mt-2"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px dashed rgba(17,145,180,0.3)', color: '#1191B4' }}>
              + Ajouter un rappel
            </button>
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 px-5"
        style={{ background: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(17,145,180,0.12)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        {[
          { id: 'home',      label: 'Accueil',   path: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25', route: '/dashboard' },
          { id: 'commandes', label: 'Commandes', path: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z', route: '/commandes' },
          { id: 'sante',     label: 'Santé',     path: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3', route: '/sante' },
          { id: 'pharmacies', label: 'Pharmacies', path: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', route: '/pharmacies' },
          { id: 'profil',    label: 'Profil',    path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', route: '/profil' },
        ].map(({ id, label, path, route }) => (
          <button key={id} onClick={() => navigate(route)} className="flex flex-col items-center gap-1">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke={id === 'sante' ? '#0E4554' : '#B4B2A9'} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
            <span className="font-medium" style={{ color: id === 'sante' ? '#0E4554' : '#B4B2A9', fontSize: 10 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}