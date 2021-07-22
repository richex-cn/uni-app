export {
  ViewJSBridge,
  subscribeViewMethod,
  unsubscribeViewMethod,
  registerViewMethod,
} from './bridge'
export { initView } from './init'
export { initViewPlugin } from './plugin'
export {
  createNativeEvent,
  $nne as normalizeNativeEvent,
} from './plugin/componentInstance'