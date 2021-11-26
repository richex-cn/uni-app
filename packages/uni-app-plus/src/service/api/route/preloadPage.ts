import { parseQuery } from '@dcloudio/uni-shared'
import {
  API_PRELOAD_PAGE,
  API_TYPE_PRELOAD_PAGE,
  PreloadPageProtocol,
  API_UN_PRELOAD_PAGE,
  API_TYPE_UN_PRELOAD_PAGE,
  UnPreloadPageProtocol,
  defineAsyncApi,
  defineSyncApi,
} from '@dcloudio/uni-api'
import {
  preloadWebview,
  closePreloadWebview,
} from '../../framework/page/preLoad'

export const unPreloadPage = defineSyncApi<API_TYPE_UN_PRELOAD_PAGE>(
  API_UN_PRELOAD_PAGE,
  ({ url }) => {
    const webview = closePreloadWebview({
      url,
    })
    if (webview) {
      return {
        id: webview.id,
        url,
        errMsg: 'unPreloadPage:ok',
      }
    }
    return {
      url,
      errMsg: 'unPreloadPage:fail not found',
    }
  },
  UnPreloadPageProtocol
)

export const preloadPage = defineAsyncApi<API_TYPE_PRELOAD_PAGE>(
  API_PRELOAD_PAGE,
  ({ url }, { resolve, reject }) => {
    const urls = url.split('?')
    const path = urls[0]
    const query = parseQuery(urls[1] || '')
    const webview = preloadWebview({
      url,
      path,
      query,
    })
    resolve({
      id: webview.id,
      url,
      errMsg: 'preloadPage:ok',
    })
  },
  PreloadPageProtocol
)