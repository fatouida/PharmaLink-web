export type StatutKYC = 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'SUSPENDU'

export type StatutCommande =
  | 'RECUE'
  | 'ORDONNANCE_VERIFIEE'
  | 'EN_PREPARATION'
  | 'LIVREUR_ASSIGNE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ANNULEE'
  | 'PROBLEME'

export type ModePaiement = 'WAVE' | 'ORANGE_MONEY' | 'CASH_LIVRAISON'

export type StatutLivraison =
  | 'EN_ATTENTE'
  | 'ASSIGNE'
  | 'RECUPERE'
  | 'LIVRE'
  | 'ECHOUE'

export type StatutOrdonnance =
  | 'SOUMISE'
  | 'EN_VERIFICATION'
  | 'VALIDEE'
  | 'REJETEE'

export interface PatientResponse {
  id: number
  telephone: string
  nom: string
  prenom: string
  email?: string
  adresse?: string
  statutKyc: StatutKYC
  actif: boolean
  createdAt: string
}

export interface Pharmacie {
  id: number
  nom: string
  adresse: string
  telephone: string
  numeroAgrement: string
  latitude?: number
  longitude?: number
  estDeGarde: boolean
  actif: boolean
}

export interface Commande {
  id: number
  numero: string
  patient: PatientResponse
  pharmacie: Pharmacie
  statut: StatutCommande
  modePaiement: ModePaiement
  montantTotal: number
  fraisLivraison: number
  modeUrgence: boolean
  adresseLivraison: string
  createdAt: string
}

export interface Livraison {
  id: number
  commande: Commande
  codeSMS: string
  statut: StatutLivraison
  note?: number
  commentaire?: string
  heureAssignation?: string
  heureRecuperation?: string
  heureLivraison?: string
}

export interface Ordonnance {
  id: number
  urlPhoto: string
  statut: StatutOrdonnance
  motifRejet?: string
  utilisee: boolean
  dateValidite?: string
  dateUpload: string
}

export interface Paiement {
  id: number
  montant: number
  devise: string
  operateur: string
  transactionId?: string
  statut: string
  createdAt: string
}