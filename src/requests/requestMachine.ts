import Store from '@/store'
import { hasTokenExpired, objectToQueryParams, waitTheCondition } from '@/utils/helpers/helpFunctions'
import fetch from 'node-fetch'
import Router from '@/router'
import routes from '@/router/routes'

interface AdditionalRequestParams {
  customURL?: string
  contentType?: string
  corsMode?: 'cors' | 'navigate' | 'no-cors' | 'same-origin'
  disabledErrorCodes?: number[]
  paramsInLink?: boolean
  disableConsoleErrorOutputInTests?: boolean
  alwaysRefreshToken?: boolean
}

export interface RequestMachineResponse {
  code: number
  body?: any
  isSuccessful: boolean
}

export const fetchRequest = async (
  methodName: string,
  requestMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  usesJWT?: boolean,
  params?: any,
  options: AdditionalRequestParams = {}): Promise<RequestMachineResponse> => {
  // #region Default options.
  if (!options.customURL) {
    options.customURL = !process.env.VUE_APP_ENV || process.env.VUE_APP_ENV === 'development'
      ? process.env.VUE_APP_BASE_API_URL
      : process.env.VUE_APP_BASE_API_URL_PROD
  }
  if (!options.contentType) options.contentType = 'application/json'
  else if (options.contentType === 'auto') options.contentType = undefined

  if (!options.corsMode) options.corsMode = 'cors'

  // Коды ошибок, при которых не нужно выводить уведомление.
  if (!options.disabledErrorCodes) options.disabledErrorCodes = []

  // Нужно ли передавать параметры как для GET запроса.
  if (!options.paramsInLink) options.paramsInLink = false

  // Нужно ли выводить ошибки в консоль в тестах. Полезно в тех случаях, когда
  // получение ошибки - ожидаемое тестом поведение.
  if (!options.disableConsoleErrorOutputInTests) options.disableConsoleErrorOutputInTests = false

  // Нужно ли *обязательно* обновлять токен при данном запросе.
  if (!options.alwaysRefreshToken) options.alwaysRefreshToken = false
  // #endregion

  if (usesJWT) await waitTheCondition(() => Store.getters.accessToken !== 'refreshing', 200)

  // Validate token.
  let token = Store.getters.accessToken
  if ((usesJWT && token && hasTokenExpired(token)) || options.alwaysRefreshToken) {
    const refreshResult = await refreshToken()
    if (!refreshResult) return { code: 0, isSuccessful: false }
    token = Store.getters.accessToken
  }

  // Arguments for GET methods.
  let getArgs = ''
  if (params && (requestMethod === 'GET' || options.paramsInLink)) {
    getArgs = objectToQueryParams(params)
  }

  // Headers.
  const headers = {
    Accept: '*/*',
    Authorization: usesJWT ? `Bearer ${token}` : ''
  } as any
  if (options.contentType) headers['Content-Type'] = options.contentType

  // Body.
  let body
  if (params && (requestMethod !== 'GET' && !options.paramsInLink)) {
    if (options.contentType === 'application/json') body = JSON.stringify(params)
    else body = params
  }
  const requestParams = {
    mode: options.corsMode,
    method: requestMethod,
    headers: new Headers(headers),
    body
  }
  let response = await fetch(`${options.customURL}${methodName}/${getArgs}`, requestParams)
  if (response.status === 401 && usesJWT) {
    const refreshResult = await refreshToken()
    if (!refreshResult) return { code: 0, isSuccessful: false }
    requestParams.headers.set('Authorization', `Bearer ${Store.getters.accessToken}`)
    response = await fetch(`${options.customURL}${methodName}/${getArgs}`, requestParams)
    if (response.status === 401) {
      Store.commit('setAccessToken', '')
      Store.commit('setRefreshToken', '')
      Router.push(routes.auth.base)
      return { code: 0, isSuccessful: false }
    }
  }
  let bodyOfResponse
  try { bodyOfResponse = await response.json() } catch (e) { bodyOfResponse = {} }
  if ((!response.status || !response.status.toString().startsWith('2')) &&
      !response.status.toString().startsWith('0') &&
      !options.disabledErrorCodes!.includes(response.status)) {
    let error
    // Проверка на наличие значений в теле респонса.
    if (Object.keys(bodyOfResponse).length) {
      bodyOfResponse.errorMessage = undefined
      error = getErrorMessage(bodyOfResponse)
    } else {
      error = `Сервер вернул ошибку со статусом ${response.status}`
      if (response.statusText) error += ` (${response.statusText})`
    }
    if (response.status !== 401) {
      Store.commit('pushNotification', {
        title: `Ошибка при отправке запроса \n ${methodName}`,
        description: error
      })
      if (process.env.NODE_ENV === 'test' && response.status !== 412 && !options.disableConsoleErrorOutputInTests) {
        console.error(`${methodName}: ${error} \nparams: ${JSON.stringify(params)}`)
      }
    }
  }
  return { code: response.status, body: bodyOfResponse, isSuccessful: response.status.toString().startsWith('2') }
}

const getErrorMessage = (json: object) => {
  return JSON.stringify(json, null, ' ')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '')
    .replace(/,/g, '')
    .replace(/"/g, '')
    .split('\n')
    .filter((err) => err.trim())
    .join('\n')
}

const refreshToken = async () => {
  const token = Store.getters.refreshToken
  Store.commit('setAccessToken', 'refreshing')
  Store.commit('setRefreshToken', 'refreshing')
  const response = await fetchRequest('auth/token/refresh', 'POST', false, { refresh: token })
  if (response && response.body && response.body.access) {
    Store.commit('setAccessToken', response.body.access)
    Store.commit('setRefreshToken', response.body.refresh)
  } else {
    Store.commit('setAccessToken', '')
    Store.commit('setRefreshToken', '')
    Router.push(routes.auth.base)
    return false
  }
  return true
}

export const fetchMediaRequest = async (responseOfImageRequest: any, file: File) => {
  const formData = new FormData()
  const responseBody = responseOfImageRequest.body
  const fields = responseBody.fields

  Object.keys(fields).forEach((key) => {
    formData.append(key, fields[key])
  })
  formData.append('file', file)

  const customOptions: AdditionalRequestParams = {
    customURL: process.env.VUE_APP_IMAGES_SERVICE_URL,
    contentType: 'auto',
    corsMode: 'no-cors'
  }

  await fetchRequest(
    responseBody.url.substring(process.env.VUE_APP_IMAGES_SERVICE_URL.length),
    'POST',
    false,
    formData,
    customOptions)
}
