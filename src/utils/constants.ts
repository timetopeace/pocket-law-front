import { SideBarSection, DeeplinkTypeInfo, DeeplinkParam } from '@/interfaces'
import Routes from '@/router/routes'

export const sections = [
  {
    title: 'Заказы',
    link: Routes.orders.base,
    permission: { section: 'catalog', name: 'view_order' }
  },
  {
    title: 'Клиенты',
    link: Routes.users.base,
    permission: { section: 'authentication', name: 'view_commonprofile' }
  },
]
export const deeplinkOptions = [
  {
    label: 'Переход в профиль',
    value: {
      id: '1',
      name: 'profile',
      parameters: []
    } as DeeplinkTypeInfo
  }
]

