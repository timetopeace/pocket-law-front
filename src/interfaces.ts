export type OrderStatus = 'draft' | 'processed' | 'ready' | 'closed' | 'canceled' | 'alert'
export type UserStatus = 'active' | 'partial banned' | 'banned'

export type ItemStatus = OrderStatus | UserStatus

export interface Permission {
  section: string
  name: string
}

export interface SideBarSection{
  title: string
  link: string
  permission: Permission
  subSections?: SideBarSubSection[]
}

export interface SideBarSubSection {
  title: string
  link: string
  permission: Permission
}

export interface DeeplinkTypeInfo {
  name: string
  parameters: DeeplinkParam[]
}

export interface DeeplinkParam {
  name: string
  paramName: string
  selectedValue: any
}
