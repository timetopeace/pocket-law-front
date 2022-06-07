import { UserStatus } from "@/interfaces";

export interface FullClientProfile {
  userProfile: UserProfile
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  patronymicName: string
  status: UserStatus
  phone: string
  email: string
  createdAt: string | Date
  userId: string
}


export interface AuthParams {
  phoneNumber: string
  password: string
}

export interface PaginationParams {
  limit: number
  offset: number
}


export interface DocumentPagination {
  limit: number
  offset: number
  value: Document[]
  finishedLoadingAllItems: boolean
}

export interface LocalNotification {
  id: number
  title: string
  description: string
  duration: number
  action?: Function
  meta: any
}


export interface Container {
  volume: number
  quantity: number
}

export interface StaffProfile {
  id: string
  email: string
  phone: string
  stores: string[]
  groups: string[]
  permissions: string[]
}
