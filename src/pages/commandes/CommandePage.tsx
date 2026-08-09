import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type Step = 'search' | 'panier-otc' | 'panier-ordo' | 'upload' | 'pay' | 'confirm'

interface Medicament {
  id: number
  nom: string
  categorie: string
  prix: number
  surOrdonnance: boolean
  equivalents?: string[]
}

interface Pharmacie {
  id: number
  initiales: string
  nom: string
  distance: string
  enStock: boolean
  deGarde: boolean
  note: number
  avis: number
  delaiMin: number
}

const MEDICAMENTS: Medicament[] = [
  { id: 1, nom: 'Paracétamol 500mg', categorie: 'Antidouleur · Fièvre', prix: 2400, surOrdonnance: false },
  { id: 2, nom: 'Amoxicilline 1g', categorie: 'Antibiotique', prix: 2400, surOrdonnance: true },
  { id: 3, nom: 'Ibuprofène 400mg', categorie: 'Anti-inflammatoire', prix: 1800, surOrdonnance: false },
  { id: 4, nom: 'Metformine 850mg', categorie: 'Diabète', prix: 3200, surOrdonnance: true },
  {
    id: 5, nom: 'Doliprane 500mg', categorie: 'Antidouleur · Fièvre', prix: 2200, surOrdonnance: false,
    equivalents: ['Paracétamol 500mg', 'Dafalgan 500mg', 'Efferalgan 500mg']
  },
]

const PHARMACIES: Pharmacie[] = [
  { id: 1, initiales: 'PC', nom: 'Pharmacie Centrale', distance: '350m', enStock: true, deGarde: true, note: 4.8, avis: 326, delaiMin: 25 },
  { id: 2, initiales: 'PF', nom: 'Pharmacie Fass', distance: '600m', enStock: true, deGarde: false, note: 4.5, avis: 189, delaiMin: 40 },
  { id: 3, initiales: 'HL', nom: 'Pharma HLM', distance: '1.2km', enStock: false, deGarde: false, note: 4.2, avis: 94, delaiMin: 60 },
]

const FRAIS_LIVRAISON = 500

function Stars({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(note))}</span>
      <span className="text-xs font-medium" style={{ color: '#0E4554' }}>{note}</span>
    </div>
  )
}

function Badge({ surOrdonnance }: { surOrdonnance: boolean }) {
  return surOrdonnance
    ? <span className="text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0" style={{ background: '#FFF3E0', color: '#B85C00' }}>Ordonnance</span>
    : <span className="text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0" style={{ background: '#E8F5EE', color: '#0F6E56' }}>Sans ordo</span>
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

function BtnMain({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-4 rounded-2xl text-sm font-medium mt-3 flex-shrink-0"
      style={{ background: '#0E4554', color: '#C1EAF5' }}>
      {label}
    </button>
  )
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-3 flex-shrink-0">
      <button onClick={onBack} className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.2)' }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0E4554" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
      </button>
      <span className="font-medium text-base" style={{ color: '#0E4554' }}>{title}</span>
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1 rounded-full mb-4 flex-shrink-0" style={{ background: 'rgba(14,69,84,0.1)' }}>
      <div className="h-1 rounded-full transition-all" style={{ background: '#1191B4', width: `${pct}%` }} />
    </div>
  )
}

function PharmaList({ pharmacies, selected, onSelect }: {
  pharmacies: Pharmacie[]
  selected: number
  onSelect: (id: number) => void
}) {
  return (
    <Glass className="mb-4">
      {pharmacies.map((p, i) => (
        <div key={p.id} onClick={() => p.enStock && onSelect(p.id)}
          className="flex items-center gap-3 py-3 cursor-pointer"
          style={{
            borderBottom: i < pharmacies.length - 1 ? '0.5px solid rgba(17,145,180,0.1)' : 'none',
            opacity: p.enStock ? 1 : 0.4
          }}>
          <div className="flex items-center justify-center rounded-xl text-xs font-medium flex-shrink-0"
            style={{ width: 38, height: 38, background: p.enStock ? '#0E4554' : '#B4B2A9', color: '#C1EAF5' }}>
            {p.initiales}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{p.nom}</div>
              {p.deGarde && <span className="text-xs font-medium px-1.5 py-0.5 rounded-md" style={{ background: '#FFF3E0', color: '#B85C00' }}>Garde</span>}
            </div>
            <Stars note={p.note} />
            <div className="text-xs mt-0.5" style={{ color: p.enStock ? '#1191B4' : '#E24B4A' }}>
              {p.distance} · {p.enStock ? `En stock · ~${p.delaiMin} min` : 'Rupture de stock'}
            </div>
          </div>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: selected === p.id ? '#0E4554' : 'transparent',
              border: selected === p.id ? '2px solid #0E4554' : '2px solid rgba(17,145,180,0.3)'
            }}>
            {selected === p.id && (
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            )}
          </div>
        </div>
      ))}
    </Glass>
  )
}

export default function CommandePage() {
  const navigate = useNavigate()
  const { medicamentId } = useParams()
  const [step, setStep] = useState<Step>('search')
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState<string[]>(['Toutes'])
  const [medSelected, setMedSelected] = useState<Medicament | null>(null)
  const [quantite, setQuantite] = useState(1)
  const [pharmSelected, setPharmSelected] = useState<number>(1)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [aiScore] = useState(94)
  const [modeLivraison, setModeLivraison] = useState<'livraison' | 'retrait'>('livraison')

  useEffect(() => {
    if (medicamentId) {
      const med = MEDICAMENTS.find(m => m.id === Number(medicamentId))
      if (med) {
        setMedSelected(med)
        setStep(med.surOrdonnance ? 'panier-ordo' : 'panier-otc')
      }
    }
  }, [medicamentId])

  const filteredMeds = MEDICAMENTS.filter(m =>
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    m.categorie.toLowerCase().includes(search.toLowerCase())
  )

  const pharmChoisie = PHARMACIES.find(p => p.id === pharmSelected)
  const total = medSelected
    ? medSelected.prix * quantite + (modeLivraison === 'livraison' ? FRAIS_LIVRAISON : 0)
    : 0

  const selectMed = (med: Medicament) => {
    setMedSelected(med)
    setQuantite(1)
    setPharmSelected(1)
    setAiState('idle')
    setStep(med.surOrdonnance ? 'panier-ordo' : 'panier-otc')
  }

  const startAI = () => {
    setAiState('loading')
    setTimeout(() => setAiState('done'), 2000)
  }

  const toggleFiltre = (f: string) => {
    setFiltre(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev.filter(x => x !== 'Toutes'), f]
    )
  }

  const CarteMed = ({ maxQty = 5 }: { maxQty?: number }) => (
    <div className="flex items-center gap-3 p-4 rounded-2xl mb-4"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(17,145,180,0.2)' }}>
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1191B4" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3"/>
      </svg>
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{medSelected?.nom}</div>
        <div className="text-xs" style={{ color: '#1191B4' }}>{medSelected?.prix.toLocaleString()} FCFA / boîte</div>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => setQuantite(q => Math.max(1, q - 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#0E4554', color: '#C1EAF5', border: 'none', fontSize: 16 }}>−</button>
          <span className="text-base font-medium" style={{ color: '#0E4554' }}>{quantite}</span>
          <button onClick={() => setQuantite(q => Math.min(maxQty, q + 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#0E4554', color: '#C1EAF5', border: 'none', fontSize: 16 }}>+</button>
          <span className="text-xs" style={{ color: '#B4B2A9' }}>boîte(s){maxQty === 3 ? ' · max 3' : ''}</span>
        </div>
      </div>
      <Badge surOrdonnance={medSelected?.surOrdonnance ?? false} />
    </div>
  )

  const RecapTotal = () => (
    <Glass>
      <div className="flex justify-between text-sm mb-2" style={{ color: '#0E4554' }}>
        <span>{medSelected?.nom} × {quantite}</span>
        <span className="font-medium">{((medSelected?.prix ?? 0) * quantite).toLocaleString()} FCFA</span>
      </div>
      {modeLivraison === 'livraison' && (
        <div className="flex justify-between text-sm mb-2" style={{ color: '#0E4554' }}>
          <span>Livraison (~{pharmChoisie?.delaiMin} min)</span>
          <span>{FRAIS_LIVRAISON.toLocaleString()} FCFA</span>
        </div>
      )}
      <div className="flex justify-between pt-3" style={{ borderTop: '0.5px solid rgba(17,145,180,0.15)' }}>
        <span className="font-medium" style={{ color: '#0E4554' }}>Total</span>
        <span className="text-lg font-medium" style={{ color: '#0E4554' }}>{total.toLocaleString()} FCFA</span>
      </div>
    </Glass>
  )

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: '#C1EAF5' }}>
      <div className="flex-1 flex flex-col p-5 overflow-hidden">

        {/* SEARCH */}
        {step === 'search' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <BackHeader title="Commander" onBack={() => navigate('/dashboard')} />
            <ProgressBar pct={20} />
            <div className="relative mb-3 flex-shrink-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B4B2A9" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un médicament..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(17,145,180,0.2)', color: '#0E4554' }}
              />
            </div>
            <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
              {['Toutes', 'Proches', 'De garde', 'Sans ordonnance'].map(f => (
                <button key={f} onClick={() => toggleFiltre(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={filtre.includes(f)
                    ? { background: '#0E4554', color: '#C1EAF5', border: '1px solid #0E4554' }
                    : { background: 'rgba(255,255,255,0.6)', color: '#0E4554', border: '1px solid rgba(17,145,180,0.2)' }
                  }>
                  {f}
                </button>
              ))}
            </div>
            <SectionLabel>Résultats</SectionLabel>
            <Glass className="overflow-y-auto flex-1">
              {filteredMeds.map((med, i) => (
                <div key={med.id} onClick={() => selectMed(med)}
                  className="flex items-center justify-between py-3 cursor-pointer"
                  style={{ borderBottom: i < filteredMeds.length - 1 ? '0.5px solid rgba(17,145,180,0.1)' : 'none' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{med.nom}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{med.categorie}</div>
                    {med.equivalents && (
                      <div className="text-xs mt-1" style={{ color: '#B85C00' }}>
                        💊 Équivalents : {med.equivalents.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                  <Badge surOrdonnance={med.surOrdonnance} />
                </div>
              ))}
            </Glass>
          </div>
        )}

        {/* PANIER OTC */}
        {step === 'panier-otc' && medSelected && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <BackHeader title="Mon panier" onBack={() => setStep('search')} />
            <ProgressBar pct={40} />
            <CarteMed maxQty={5} />
            <SectionLabel>Choisir une pharmacie</SectionLabel>
            <PharmaList pharmacies={PHARMACIES} selected={pharmSelected} onSelect={setPharmSelected} />
            <RecapTotal />
            <BtnMain label="Passer au paiement" onClick={() => setStep('pay')} />
          </div>
        )}

        {/* PANIER ORDO */}
        {step === 'panier-ordo' && medSelected && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <BackHeader title="Mon panier" onBack={() => setStep('search')} />
            <ProgressBar pct={40} />
            <CarteMed maxQty={3} />
            <SectionLabel>Choisir une pharmacie</SectionLabel>
            <PharmaList pharmacies={PHARMACIES} selected={pharmSelected} onSelect={setPharmSelected} />
            <RecapTotal />
            <BtnMain label="Valider et uploader l'ordonnance" onClick={() => setStep('upload')} />
          </div>
        )}

        {/* UPLOAD + AI */}
        {step === 'upload' && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <BackHeader title="Ordonnance" onBack={() => setStep('panier-ordo')} />
            <ProgressBar pct={65} />

            {aiState === 'idle' && (
              <>
                <label className="flex flex-col items-center gap-2 py-6 px-4 rounded-2xl cursor-pointer mb-4"
                  style={{ border: '1.5px dashed rgba(17,145,180,0.4)', background: 'rgba(193,234,245,0.3)' }}
                  onClick={startAI}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#1191B4" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <span className="text-sm text-center" style={{ color: '#0E4554', opacity: 0.6 }}>
                    Photo de votre ordonnance<br />
                    <strong style={{ color: '#1191B4' }}>Appuyer pour uploader</strong>
                  </span>
                </label>
                <SectionLabel>L'IA va vérifier automatiquement</SectionLabel>
                <Glass>
                  {['Lisibilité', 'Date de validité', 'Nom du patient', 'Signature / cachet médecin', 'Correspondance médicament'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 last:mb-0" style={{ color: '#0E4554', opacity: 0.5 }}>
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: '1.5px solid rgba(17,145,180,0.3)' }} />
                      <span className="text-xs">{item}</span>
                    </div>
                  ))}
                </Glass>
              </>
            )}

            {aiState === 'loading' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium mb-2" style={{ color: '#0E4554' }}>Analyse IA en cours...</div>
                  <div className="text-xs" style={{ color: '#1191B4' }}>Vérification de votre ordonnance</div>
                </div>
                <div className="w-full rounded-full h-1" style={{ background: 'rgba(14,69,84,0.1)' }}>
                  <div className="h-1 rounded-full animate-pulse" style={{ background: '#1191B4', width: '70%' }} />
                </div>
              </div>
            )}

            {aiState === 'done' && (
              <>
                {aiScore >= 80 ? (
                  <div className="rounded-2xl p-4 mb-3" style={{ background: '#E8F5EE', border: '1px solid rgba(29,158,117,0.2)' }}>
                    <div className="text-sm font-medium mb-1" style={{ color: '#0F6E56' }}>✓ Ordonnance validée — Score {aiScore}%</div>
                    <div className="text-xs" style={{ color: '#0F6E56' }}>Votre pharmacie devrait confirmer sous <strong>2 à 5 minutes</strong></div>
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 mb-3" style={{ background: '#FFF3E0', border: '1px solid rgba(184,92,0,0.2)' }}>
                    <div className="text-sm font-medium mb-1" style={{ color: '#B85C00' }}>⚠ Vérification manuelle nécessaire</div>
                    <div className="text-xs" style={{ color: '#B85C00' }}>Délai estimé : <strong>10 à 15 minutes</strong></div>
                  </div>
                )}

                <Glass className="mb-3">
                  {['Lisible et nette', 'Valide jusqu\'au 15/09/2026', 'Au nom de Fatou Diallo', 'Dr Moussa Seck · Cachet présent', 'Amoxicilline 1g — correspondance OK'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0F6E56" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span className="text-xs" style={{ color: '#0F6E56' }}>{item}</span>
                    </div>
                  ))}
                </Glass>

                {aiScore >= 80 && (
                  <div className="rounded-2xl p-4 mb-3" style={{ background: '#FFF3E0', border: '1px solid rgba(184,92,0,0.2)' }}>
                    <div className="text-sm font-medium mb-1" style={{ color: '#B85C00' }}>⚠ Validation rapide par la pharmacie</div>
                    <div className="text-xs" style={{ color: '#B85C00' }}>Quantité supérieure à la prescription — le pharmacien confirmera</div>
                  </div>
                )}

                <BtnMain label="Passer au paiement" onClick={() => setStep('pay')} />
              </>
            )}
          </div>
        )}

        {/* PAIEMENT */}
        {step === 'pay' && medSelected && (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <BackHeader title="Paiement" onBack={() => setStep(medSelected.surOrdonnance ? 'upload' : 'panier-otc')} />
            <ProgressBar pct={85} />

            <Glass className="mb-4">
              <SectionLabel>Mode de livraison</SectionLabel>
              <div className="flex gap-3">
                {(['livraison', 'retrait'] as const).map(mode => (
                  <div key={mode} onClick={() => setModeLivraison(mode)}
                    className="flex-1 py-3 px-2 rounded-2xl text-center cursor-pointer transition-all"
                    style={modeLivraison === mode
                      ? { border: '1.5px solid #0E4554', background: 'rgba(14,69,84,0.08)' }
                      : { border: '1px solid rgba(17,145,180,0.2)', background: 'rgba(255,255,255,0.6)' }
                    }>
                    <div className="text-xs font-medium" style={{ color: '#0E4554' }}>
                      {mode === 'livraison' ? '🛵 Livraison' : '🏪 Retrait'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>
                      {mode === 'livraison' ? `~${pharmChoisie?.delaiMin} min` : 'En pharmacie'}
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            <SectionLabel>Mode de paiement</SectionLabel>
            {[
              { label: 'Wave', bg: '#E8F5EE', color: '#0F6E56', dot: '#0E4554', text: 'W' },
              { label: 'Orange Money', bg: '#FFF3E0', color: '#B85C00', dot: '#F97316', text: 'OM' },
              { label: 'Cash à la livraison', bg: '#F3EEF8', color: '#5B2C6F', dot: '#5B2C6F', text: '💵' },
            ].map(({ label, bg, color, dot, text }) => (
              <div key={label} onClick={() => setStep('confirm')}
                className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer mb-2"
                style={{ background: bg, border: `1px solid ${color}22` }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: dot }}>{text}</div>
                  <span className="text-sm font-medium" style={{ color }}>{label}</span>
                </div>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
              </div>
            ))}

            <RecapTotal />
          </div>
        )}

        {/* CONFIRMATION */}
        {step === 'confirm' && (
          <div className="flex flex-col flex-1 items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: '#E8F5EE', border: '2px solid rgba(29,158,117,0.3)' }}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#0F6E56" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <div className="text-xl font-medium mb-1" style={{ color: '#0E4554' }}>Commande confirmée</div>
            <div className="text-sm mb-6" style={{ color: '#1191B4' }}>Commande #PL-5892</div>

            <Glass className="w-full text-left mb-4">
              <SectionLabel>Suivi en temps réel</SectionLabel>
              {[
                { label: 'Commande reçue', icon: '✓', done: true, active: false, color: '#0F6E56', bg: '#E8F5EE' },
                { label: `Ordonnance analysée par IA (${aiScore}%)`, icon: '✓', done: medSelected?.surOrdonnance ?? false, active: false, color: '#0F6E56', bg: '#E8F5EE' },
                { label: 'Confirmation de la pharmacie', icon: '⏳', done: false, active: true, color: '#B85C00', bg: '#FFF3E0' },
                { label: 'Préparation de la commande', icon: '📦', done: false, active: false, color: '#B4B2A9', bg: 'rgba(14,69,84,0.08)' },
                { label: 'Livreur en route', icon: '🚴', done: false, active: false, color: '#B4B2A9', bg: 'rgba(14,69,84,0.08)' },
                { label: 'Livrée', icon: '✅', done: false, active: false, color: '#B4B2A9', bg: 'rgba(14,69,84,0.08)' },
              ].filter(s => medSelected?.surOrdonnance || s.label !== `Ordonnance analysée par IA (${aiScore}%)`).map(({ label, done, active, color, bg }, i) => (
                <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: done || active ? color : '#B4B2A9' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color }}>{label}</span>
                </div>
              ))}
            </Glass>

            {pharmChoisie && modeLivraison === 'livraison' && (
              <div className="w-full rounded-2xl p-3 mb-4 text-left"
                style={{ background: 'rgba(17,145,180,0.08)', border: '1px solid rgba(17,145,180,0.15)' }}>
                <div className="text-xs font-medium" style={{ color: '#1191B4' }}>
                  🚴 Livraison estimée depuis {pharmChoisie.nom} : <strong>~{pharmChoisie.delaiMin} min</strong>
                </div>
              </div>
            )}

            <p className="text-xs mb-6" style={{ color: '#0E4554', opacity: 0.5 }}>SMS envoyé à chaque étape</p>

            <button onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl text-sm font-medium"
              style={{ background: '#0E4554', color: '#C1EAF5' }}>
              Retour à l'accueil
            </button>
          </div>
        )}

      </div>
    </div>
  )
}