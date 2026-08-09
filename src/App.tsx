import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CommandePage from './pages/commandes/CommandePage'
import CommandesPage from './pages/commandes/CommandesPage'
import SantePage from './pages/Sante/SantePage'
import PharmaciesPage from './pages/pharmacies/PharmaciesPage'
import ProfilPage from './pages/profil/ProfilPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/commande" element={<CommandePage />} />
      <Route path="/commande/:medicamentId" element={<CommandePage />} />
      <Route path="/commandes" element={<CommandesPage />} />
      <Route path="/Sante" element={<SantePage />} />
      <Route path="/pharmacies" element={<PharmaciesPage />} />
      <Route path="/profil" element={<ProfilPage />} />
    </Routes>
  )
}

export default App