declare var JsBarcode: any

declare module 'node-fetch'

declare const firebase: any

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
