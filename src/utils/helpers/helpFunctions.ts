import { ClientStatus, GrandPrizeStatus, ItemStatus, NotificationStatus, OfferStatus, OrderStatus, StoryStatus } from '@/interfaces'
import JwtDecode from 'jwt-decode'

interface TokenInfo {
  exp: number
  jti: string
  // eslint-disable-next-line
  token_type: string
  // eslint-disable-next-line
  user_id: number
}

export const hasTokenExpired = (token: string): boolean => {
  const decoded = JwtDecode<TokenInfo>(token)
  return Date.now() >= decoded.exp * 1000
}

// Входной формат даты: dd/MM/yyyy, функция возвращает дату в формате: yyyy/MM/dd.
export const getDateFormatted = (date: string, delimeter: string, finalDelimeter: string = '.') => {
  if (!date) return '-'
  const dateLocaled = new Date(date).toLocaleDateString('ru')
  const dateSplit = dateLocaled.split(delimeter)
  return [dateSplit[2], dateSplit[1], dateSplit[0]].join(finalDelimeter)
}

// UTCTimeZoneOffsetInMinutes - часовой пояс в минутах, к которому нужно привести время.
export const getDateTimeFormatted = (date: string, delimeter: string, finalDelimeter: string = '.', UTCTimeZoneOffsetInMinutes: number | null = null) => {
  if (!date) return '-'
  const newDate = new Date(date)
  if (UTCTimeZoneOffsetInMinutes) {
    const localTimeOffset = new Date().getTimezoneOffset()
    newDate.setMinutes(newDate.getMinutes() + localTimeOffset + UTCTimeZoneOffsetInMinutes)
  }
  const dateLocaled = newDate.toLocaleDateString('ru')
  const dateSplit = dateLocaled.split(delimeter)
  const dateString = [dateSplit[2], dateSplit[1], dateSplit[0]].join(finalDelimeter)
  return `${dateString} ${newDate.getHours()}:${newDate.getMinutes().toString().length > 1 ? newDate.getMinutes() : '0' + newDate.getMinutes()}`
}

export const setToMoscowMidnightTime = (date: string | Date) => {
  let newDate: string | Date = new Date(date)
  newDate.setMinutes(0)
  newDate.setHours(0)
  const dateSplit = newDate.toString().split('+')
  newDate = dateSplit[0] + '+0300'
  newDate = new Date(newDate)
  return newDate
}

export const trimString = (text: string, maxLength: number, placeDots: boolean = true) => {
  if (!text || text.length <= maxLength) return text
  const result = text.substring(0, text.lastIndexOf(' ', maxLength))
  if (!result.length) return placeDots ? text.substring(0, maxLength) + '...' : text.substring(0, maxLength)
  return placeDots ? result + '...' : result
}

export const objectToQueryParams = (object: { [key: string]: any }): string => {
  let getArgs = '?'
  Object.keys(object).forEach(paramKey => {
    if (Array.isArray(object[paramKey])) {
      object[paramKey].forEach((value: string) => {
        getArgs += `${paramKey}=${value}&`
      })
    } else {
      getArgs += `${paramKey}=${object[paramKey]}&`
    }
  })
  return getArgs.slice(0, -1)
}

export type StatusType = 'orders' | 'stories' | 'offers' | 'grand-prize' | 'notifications' | 'clients'

export interface Status {
  name: string
  color: string
  title?: string
}

export const getGenderLetter = (gender: string): string => {
  switch (gender) {
    case 'male': return 'М'
    case 'female': return 'Ж'
    default: return '-'
  }
}

export const getStatusForAny = (statusType: StatusType, status: ItemStatus): Status => {
  switch (statusType) {
    case 'orders': return getTranslatedStatusForOrder(status as OrderStatus)
    case 'stories': return getTranslatedStatusForStory(status as StoryStatus)
    case 'offers': return getTranslatedStatusForOffer(status as OfferStatus)
    case 'grand-prize': return getTranslatedStatusForGrandPrize(status as GrandPrizeStatus)
    case 'notifications': return getTranslatedStatusForNotification(status as NotificationStatus)
    case 'clients': return getTranslatedStatusForClient(status as ClientStatus)
  }
}

export const getItemStatusesForOrders = () => {
  return [
    {
      label: getTranslatedStatusForOrder('draft').name,
      value: 'draft'
    },
    {
      label: getTranslatedStatusForOrder('processed').name,
      value: 'published'
    },
    {
      label: getTranslatedStatusForOrder('ready').name,
      value: 'handling'
    },
    {
      label: getTranslatedStatusForOrder('closed').name,
      value: 'done'
    },
    {
      label: getTranslatedStatusForOrder('canceled').name,
      value: 'cancelled'
    }
  ]
}

export const waitTheCondition = (condition: () => boolean, interval: number): Promise<void> => {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (condition()) {
        clearInterval(timer)
        resolve()
      }
    }, interval)
  })
}

export const arrayMoveItem = (arr: any[], oldIndex: number, newIndex: number) => {
  while (oldIndex < 0) {
    oldIndex += arr.length
  }
  while (newIndex < 0) {
    newIndex += arr.length
  }
  if (newIndex >= arr.length) {
    var k = newIndex - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
}

export const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const deepClone = require('lodash.clonedeep')
