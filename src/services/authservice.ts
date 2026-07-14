import api from './api'
import type { PatientResponse } from '../types'

export interface LoginRequest {
  telephone?: string
  email?: string
  motDePasse: string
}

export interface SignupRequest {
  nom: string
  prenom: string
  telephone?: string
  email?: string
  motDePasse: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  type: string
  patient: PatientResponse
}

export const authService = {
  async connecter(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/connecter', data)
    return response.data
  },

  async inscrire(data: SignupRequest): Promise<PatientResponse> {
    const response = await api.post('/auth/inscrire', data)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('patient')
  }
}