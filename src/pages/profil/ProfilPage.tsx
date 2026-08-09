import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import logo from '../../assets/LOGO.png'

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`}
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(17,145,180,0.15)', backdropFilter: 'blur(12px)' }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium mb-3 tracking-widest uppercase" style={{ color: '#1191B4' }}>{children}</div>
}

function ProfilRow({ label, value, onClick, danger }: {
  label: string; value?: string; onClick?: () => void; danger?: boolean
}) {
  return (
    <div onClick={onClick}
      className="flex items-center justify-between py-3 cursor-pointer"
      style={{ borderBottom: '0.5px solid rgba(17,145,180,0.1)' }}>
      <span className="text-sm" style={{ color: danger ? '#E24B4A' : '#0E4554' }}>{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs" style={{ color: '#B4B2A9' }}>{value}</span>}
        {onClick && (
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#B4B2A9" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        )}
      </div>
    </div>
  )
}

export default function ProfilPage() {
  const navigate = useNavigate()
  const { patient, logout } = useAuthStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [langue, setLangue] = useState('Français')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initiales = patient
    ? `${patient.prenom?.[0] ?? ''}${patient.nom?.[0] ?? ''}`.toUpperCase()
    : 'PL'

  return (
    <div className="min-h-screen flex flex-col overflow-hidden pb-20" style={{ background: '#C1EAF5' }}>
      <div className="flex-1 flex flex-col p-5 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <img src={logo} alt="PharmaLink" className="h-10 w-auto" />
          <span className="text-xl font-medium" style={{ color: '#0E4554' }}>Mon profil</span>
          <div style={{ width: 40 }} />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium mb-3"
            style={{ background: '#0E4554', color: '#C1EAF5' }}>
            {initiales}
          </div>
          <div className="text-lg font-medium mb-1" style={{ color: '#0E4554' }}>
            {patient?.prenom} {patient?.nom}
          </div>
          <div className="text-sm mb-2" style={{ color: '#1191B4' }}>
            {patient?.telephone || patient?.email}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: patient?.statutKyc === 'VALIDE' ? '#E8F5EE' : '#FFF3E0' }}>
            <div className="w-2 h-2 rounded-full"
              style={{ background: patient?.statutKyc === 'VALIDE' ? '#0F6E56' : '#B85C00' }} />
            <span className="text-xs font-medium"
              style={{ color: patient?.statutKyc === 'VALIDE' ? '#0F6E56' : '#B85C00' }}>
              {patient?.statutKyc === 'VALIDE' ? 'Identité vérifiée (KYC)' : 'KYC en attente'}
            </span>
          </div>
        </div>

        {/* Infos personnelles */}
        <Glass className="mb-4">
          <SectionLabel>Informations personnelles</SectionLabel>
          <ProfilRow label="Prénom" value={patient?.prenom ?? '-'} onClick={() => {}} />
          <ProfilRow label="Nom" value={patient?.nom ?? '-'} onClick={() => {}} />
          <ProfilRow label="Téléphone" value={patient?.telephone ?? '-'} onClick={() => {}} />
          <ProfilRow label="Email" value={patient?.email ?? '-'} onClick={() => {}} />
        </Glass>

        {/* Mes adresses */}
        <Glass className="mb-4">
          <SectionLabel>Mes adresses</SectionLabel>
          <ProfilRow label="Domicile" value="Non renseignée" onClick={() => {}} />
          <ProfilRow label="Travail" value="Non renseignée" onClick={() => {}} />
          <div className="flex items-center gap-2 pt-3 cursor-pointer" onClick={() => {}}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(17,145,180,0.1)', border: '1px solid rgba(17,145,180,0.2)' }}>
              <span style={{ color: '#1191B4', fontSize: 14, lineHeight: 1 }}>+</span>
            </div>
            <span className="text-sm" style={{ color: '#1191B4' }}>Ajouter une adresse</span>
          </div>
        </Glass>

        {/* Moyens de paiement */}
        <Glass className="mb-4">
          <SectionLabel>Moyens de paiement</SectionLabel>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '0.5px solid rgba(17,145,180,0.1)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: '#0E4554' }}>W</div>
              <span className="text-sm" style={{ color: '#0E4554' }}>Wave</span>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8F5EE', color: '#0F6E56' }}>Actif</span>
          </div>
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '0.5px solid rgba(17,145,180,0.1)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: '#F97316' }}>OM</div>
              <span className="text-sm" style={{ color: '#0E4554' }}>Orange Money</span>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: '#E8F5EE', color: '#0F6E56' }}>Actif</span>
          </div>
          <div className="flex items-center gap-2 pt-3 cursor-pointer" onClick={() => {}}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(17,145,180,0.1)', border: '1px solid rgba(17,145,180,0.2)' }}>
              <span style={{ color: '#1191B4', fontSize: 14, lineHeight: 1 }}>+</span>
            </div>
            <span className="text-sm" style={{ color: '#1191B4' }}>Ajouter un moyen de paiement</span>
          </div>
        </Glass>

        {/* Langue */}
        <Glass className="mb-4">
          <SectionLabel>Langue</SectionLabel>
          {['Français', 'English', 'Wolof (bientôt)'].map((l, i) => (
            <div key={l} onClick={() => l !== 'Wolof (bientôt)' && setLangue(l)}
              className="flex items-center justify-between py-3 cursor-pointer"
              style={{ borderBottom: i < 2 ? '0.5px solid rgba(17,145,180,0.1)' : 'none', opacity: l === 'Wolof (bientôt)' ? 0.4 : 1 }}>
              <span className="text-sm" style={{ color: '#0E4554' }}>{l}</span>
              {langue === l && (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0F6E56" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              )}
            </div>
          ))}
        </Glass>

        {/* Sécurité */}
        <Glass className="mb-4">
          <SectionLabel>Sécurité</SectionLabel>
          <ProfilRow label="Mot de passe" value="Modifier" onClick={() => {}} />
          <ProfilRow label="Vérification KYC" value={patient?.statutKyc === 'VALIDE' ? 'Validée' : 'En attente'} />
        </Glass>

        {/* Préférences */}
        <Glass className="mb-4">
          <SectionLabel>Préférences</SectionLabel>
          <ProfilRow label="Notifications SMS" value="Activées" onClick={() => {}} />
          <ProfilRow label="Notifications push" value="Activées" onClick={() => {}} />
        </Glass>

        {/* Aide */}
        <Glass className="mb-6">
          <SectionLabel>Aide</SectionLabel>
          <ProfilRow label="Centre d'aide" onClick={() => {}} />
          <ProfilRow label="Conditions d'utilisation" onClick={() => {}} />
          <ProfilRow label="Politique de confidentialité" onClick={() => {}} />
          <ProfilRow label="Version" value="1.0.0" />
        </Glass>

        {/* Déconnexion */}
        <button onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 rounded-2xl text-sm font-medium mb-3"
          style={{ background: '#FDECEA', color: '#E24B4A', border: '1px solid rgba(226,75,74,0.2)' }}>
          Se déconnecter
        </button>

      </div>

      {/* Modale déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-end justify-center pb-24"
          style={{ zIndex: 20, background: 'rgba(14,69,84,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 mx-4"
            style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(17,145,180,0.2)' }}>
            <div className="text-base font-medium mb-2 text-center" style={{ color: '#0E4554' }}>
              Se déconnecter ?
            </div>
            <div className="text-sm text-center mb-5" style={{ color: '#B4B2A9' }}>
              Vous devrez vous reconnecter pour accéder à votre compte.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ background: 'rgba(14,69,84,0.08)', color: '#0E4554' }}>
                Annuler
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ background: '#E24B4A', color: '#fff' }}>
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

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
              stroke={id === 'profil' ? '#0E4554' : '#B4B2A9'} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
            <span className="font-medium" style={{ color: id === 'profil' ? '#0E4554' : '#B4B2A9', fontSize: 10 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}