import { create } from 'zustand'
import type { PatientResponse } from '../types'

interface AuthStore {
  token: string | null
  patient: PatientResponse | null
  setAuth: (token: string, patient: PatientResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token'),
  patient: JSON.parse(localStorage.getItem('patient') || 'null'),

  setAuth: (token, patient) => {
    localStorage.setItem('token', token)
    localStorage.setItem('patient', JSON.stringify(patient))
    set({ token, patient })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('patient')
    set({ token: null, patient: null })
  }
}))