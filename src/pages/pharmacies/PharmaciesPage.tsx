import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Pharmacie {
  id: number
  initiales: string
  nom: string
  adresse: string
  distance: string
  deGarde: boolean
  ouverte: boolean
  note: number
  avis: number
  livraison: boolean
  delaiMin: number
  horaires: string
  telephone: string
  favorite: boolean
}

const PHARMACIES_MOCK: Pharmacie[] = [
  {
    id: 1, initiales: 'PC', nom: 'Pharmacie Centrale', adresse: '14 Rue Carnot, Dakar',
    distance: '350m', deGarde: true, ouverte: true, note: 4.8, avis: 326,
    livraison: true, delaiMin: 25, horaires: '08h00 - 22h00', telephone: '+221 77 123 45 67', favorite: true
  },
  {
    id: 2, initiales: 'PF', nom: 'Pharmacie Fass', adresse: 'Av. Bourguiba, Dakar',
    distance: '600m', deGarde: true, ouverte: true, note: 4.5, avis: 189,
    livraison: true, delaiMin: 40, horaires: '08h00 - 21h00', telephone: '+221 77 234 56 78', favorite: false
  },
  {
    id: 3, initiales: 'HL', nom: 'Pharma HLM', adresse: 'Route de Rufisque, Dakar',
    distance: '1.2km', deGarde: false, ouverte: true, note: 4.2, avis: 94,
    livraison: true, delaiMin: 60, horaires: '08h00 - 20h00', telephone: '+221 77 345 67 89', favorite: false
  },
  {
    id: 4, initiales: 'PP', nom: 'Pharmacie Plateau', adresse: 'Rue du Dr Thèze, Plateau',
    distance: '2.1km', deGarde: false, ouverte: false, note: 4.6, avis: 241,
    livraison: true, delaiMin: 50, horaires: '08h00 - 20h00', telephone: '+221 77 456 78 90', favorite: false
  },
  {
    id: 5, initiales: 'PM', nom: 'Pharmacie Mermoz', adresse: 'Av. Cheikh Anta Diop, Mermoz',
    distance: '3.5km', deGarde: false, ouverte: true, note: 4.7, avis: 312,
    livraison: false, delaiMin: 0, horaires: '08h00 - 21h00', telephone: '+221 77 567 89 01', favorite: true
  },
]

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.15)', backdropFilter: 'blur(12px)' }}>
      {children}
    </div>
  )
}

function Stars({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(note))}</span>
      <span className="text-xs font-medium" style={{ color: '#0E4554' }}>{note}</span>
      <span className="text-xs" style={{ color: '#B4B2A9' }}>({note})</span>
    </div>
  )
}

export default function PharmaciesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtres, setFiltres] = useState<string[]>([])
  const [selected, setSelected] = useState<Pharmacie | null>(null)
  const [favorites, setFavorites] = useState<Record<number, boolean>>(
    Object.fromEntries(PHARMACIES_MOCK.map(p => [p.id, p.favorite]))
  )
  const [searchMed, setSearchMed] = useState('')

  const toggleFiltre = (f: string) => {
    setFiltres(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filtered = PHARMACIES_MOCK.filter(p => {
    if (search && !p.nom.toLowerCase().includes(search.toLowerCase()) &&
        !p.adresse.toLowerCase().includes(search.toLowerCase())) return false
    if (filtres.includes('garde') && !p.deGarde) return false
    if (filtres.includes('ouverte') && !p.ouverte) return false
    if (filtres.includes('livraison') && !p.livraison) return false
    if (filtres.includes('favorite') && !favorites[p.id]) return false
    return true
  }).sort((a, b) => {
    if (filtres.includes('note')) return b.note - a.note
    return parseFloat(a.distance) - parseFloat(b.distance)
  })

  return (
    <div className="min-h-screen flex flex-col overflow-hidden pb-20" style={{ background: '#C1EAF5' }}>
      <div className="flex-1 flex flex-col p-5 overflow-hidden">

        {selected ? (
          // ── FICHE PHARMACIE ──
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
              <button onClick={() => setSelected(null)}
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.2)' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0E4554" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
                </svg>
              </button>
              <span className="font-medium text-base" style={{ color: '#0E4554' }}>Fiche pharmacie</span>
            </div>

            {/* Header fiche */}
            <Glass className="mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center rounded-2xl text-lg font-medium flex-shrink-0"
                  style={{ width: 52, height: 52, background: '#0E4554', color: '#C1EAF5' }}>
                  {selected.initiales}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium" style={{ color: '#0E4554' }}>{selected.nom}</div>
                    <button onClick={(e) => toggleFavorite(selected.id, e)}>
                      <svg width="20" height="20" fill={favorites[selected.id] ? '#E24B4A' : 'none'}
                        viewBox="0 0 24 24" stroke={favorites[selected.id] ? '#E24B4A' : '#B4B2A9'} strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#1191B4' }}>{selected.adresse}</div>
                  <Stars note={selected.note} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded-lg"
                  style={{ background: selected.ouverte ? '#E8F5EE' : '#FDECEA', color: selected.ouverte ? '#0F6E56' : '#E24B4A' }}>
                  {selected.ouverte ? 'Ouverte' : 'Fermée'}
                </span>
                {selected.deGarde && (
                  <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#FFF3E0', color: '#B85C00' }}>
                    De garde
                  </span>
                )}
                {selected.livraison && (
                  <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8EFF8', color: '#1191B4' }}>
                    Livraison ~{selected.delaiMin} min
                  </span>
                )}
              </div>

              <div className="text-xs mb-1" style={{ color: '#0E4554' }}>
                Horaires : {selected.horaires}
              </div>
              <div className="text-xs" style={{ color: '#0E4554' }}>
                Tel : {selected.telephone}
              </div>
            </Glass>

            {/* Recherche médicament dans cette pharmacie */}
            <div className="text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: '#1191B4' }}>
              Rechercher un médicament
            </div>
            <div className="relative mb-3 flex-shrink-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#B4B2A9" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
              </svg>
              <input type="text" value={searchMed} onChange={e => setSearchMed(e.target.value)}
                placeholder="Ex: Paracétamol, Amoxicilline..."
                className="w-full pl-9 pr-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(17,145,180,0.2)', color: '#0E4554' }}
              />
            </div>

            {searchMed && (
              <Glass className="mb-4">
                {['Paracétamol 500mg', 'Amoxicilline 1g', 'Ibuprofène 400mg'].filter(m =>
                  m.toLowerCase().includes(searchMed.toLowerCase())
                ).map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < 2 ? '0.5px solid rgba(17,145,180,0.1)' : 'none' }}>
                    <span className="text-sm" style={{ color: '#0E4554' }}>{m}</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8F5EE', color: '#0F6E56' }}>En stock</span>
                  </div>
                ))}
              </Glass>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => navigate('/commande')}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ background: '#0E4554', color: '#C1EAF5' }}>
                Commander ici
              </button>
              <button className="px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: 'rgba(17,145,180,0.1)', color: '#1191B4' }}>
                Appeler
              </button>
            </div>
          </div>

        ) : (
          // ── LISTE PHARMACIES ──
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="mb-4 flex-shrink-0">
              <h1 className="text-xl font-medium mb-1" style={{ color: '#0E4554' }}>Pharmacies</h1>
              <p className="text-xs" style={{ color: '#1191B4' }}>Trouvez une pharmacie près de vous</p>
            </div>

            {/* Recherche */}
            <div className="relative mb-3 flex-shrink-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B4B2A9" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une pharmacie..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(17,145,180,0.2)', color: '#0E4554' }}
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
              {[
                { key: 'ouverte',   label: 'Ouvertes' },
                { key: 'garde',     label: 'De garde' },
                { key: 'livraison', label: 'Avec livraison' },
                { key: 'note',      label: 'Mieux notées' },
                { key: 'favorite',  label: 'Favorites' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => toggleFiltre(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all"
                  style={filtres.includes(key)
                    ? { background: '#0E4554', color: '#C1EAF5', border: '1px solid #0E4554' }
                    : { background: 'rgba(255,255,255,0.6)', color: '#0E4554', border: '1px solid rgba(17,145,180,0.2)' }
                  }>
                  {label}
                </button>
              ))}
            </div>

            {/* Liste */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-1">
              {filtered.map(p => (
                <div key={p.id} onClick={() => setSelected(p)}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.15)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center rounded-xl text-xs font-medium flex-shrink-0"
                      style={{ width: 40, height: 40, background: p.ouverte ? '#0E4554' : '#B4B2A9', color: '#C1EAF5' }}>
                      {p.initiales}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="text-sm font-medium" style={{ color: '#0E4554' }}>{p.nom}</div>
                        <button onClick={(e) => toggleFavorite(p.id, e)}>
                          <svg width="18" height="18" fill={favorites[p.id] ? '#E24B4A' : 'none'}
                            viewBox="0 0 24 24" stroke={favorites[p.id] ? '#E24B4A' : '#B4B2A9'} strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                          </svg>
                        </button>
                      </div>
                      <Stars note={p.note} />
                      <div className="text-xs mt-1" style={{ color: '#1191B4' }}>
                        {p.distance} · {p.adresse}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-lg"
                      style={{ background: p.ouverte ? '#E8F5EE' : '#FDECEA', color: p.ouverte ? '#0F6E56' : '#E24B4A' }}>
                      {p.ouverte ? 'Ouverte' : 'Fermée'}
                    </span>
                    {p.deGarde && (
                      <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#FFF3E0', color: '#B85C00' }}>
                        De garde
                      </span>
                    )}
                    {p.livraison && (
                      <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8EFF8', color: '#1191B4' }}>
                        Livraison ~{p.delaiMin} min
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className="text-4xl mb-3">🏥</div>
                  <div className="text-sm font-medium mb-1" style={{ color: '#0E4554' }}>Aucune pharmacie trouvée</div>
                  <div className="text-xs" style={{ color: '#B4B2A9' }}>Modifiez vos filtres</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 px-5"
        style={{ background: 'rgba(255,255,255,0.65)', borderTop: '1px solid rgba(17,145,180,0.12)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        {[
          { id: 'home',       label: 'Accueil',    path: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25', route: '/dashboard' },
          { id: 'commandes',  label: 'Commandes',  path: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z', route: '/commandes' },
          {id: 'sante', label: 'Santé',      path: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3', route: '/sante' },
          { id: 'pharmacies', label: 'Pharmacies', path: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', route: '/pharmacies' },
          { id: 'profil',     label: 'Profil',     path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', route: '/profil' },
        ].map(({ id, label, path, route }) => (
          <button key={id} onClick={() => navigate(route)} className="flex flex-col items-center gap-1">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
              stroke={id === 'pharmacies' ? '#0E4554' : '#B4B2A9'} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
            <span className="font-medium" style={{ color: id === 'pharmacies' ? '#0E4554' : '#B4B2A9', fontSize: 10 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}