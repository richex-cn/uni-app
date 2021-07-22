import {
  API_SWITCH_TAB,
  API_TYPE_SWITCH_TAB,
  defineAsyncApi,
  SwitchTabOptions,
  SwitchTabProtocol,
} from '@dcloudio/uni-api'
import { invokeHook } from '@dcloudio/uni-core'
import { ON_HIDE, ON_SHOW, parseUrl } from '@dcloudio/uni-shared'
import { ComponentPublicInstance } from 'vue'
import { ANI_CLOSE, ANI_DURATION } from '../../constants'
import tabBar from '../../framework/app/tabBar'
import { registerPage } from '../../framework/page'
import { getAllPages, removePage } from '../../framework/page/getCurrentPages'
import { setStatusBarStyle } from '../../statusBar'
import { closePage, navigate, RouteOptions } from './utils'
import { closeWebview, showWebview } from './webview'

export const switchTab = defineAsyncApi<API_TYPE_SWITCH_TAB>(
  API_SWITCH_TAB,
  (args, { resolve, reject }) => {
    const { url } = args
    const { path, query } = parseUrl(url)
    navigate(
      path,
      () => {
        _switchTab({
          url,
          path,
          query,
        })
          .then(resolve)
          .catch(reject)
      },
      (args as any).openType === 'appLaunch'
    )
  },
  SwitchTabProtocol,
  SwitchTabOptions
)

interface SwitchTabOptions extends RouteOptions {}

function _switchTab({
  url,
  path,
  query,
}: SwitchTabOptions): Promise<undefined> {
  tabBar.switchTab(path.slice(1))
  const pages = getCurrentPages() as ComponentPublicInstance[]
  const len = pages.length
  let callOnHide = false
  let callOnShow = false
  let currentPage: ComponentPublicInstance | undefined
  if (len >= 1) {
    // 前一个页面是非 tabBar 页面
    currentPage = pages[len - 1]! as ComponentPublicInstance
    if (currentPage && !currentPage.__isTabBar) {
      // 前一个页面为非 tabBar 页面时，目标tabBar需要强制触发onShow
      // 该情况下目标页tabBarPage的visible是不对的
      // 除非每次路由跳转都处理一遍tabBarPage的visible，目前仅switchTab会处理
      // 简单起见，暂时直接判断该情况，执行onShow
      callOnShow = true
      pages.reverse().forEach((page) => {
        if (!page.__isTabBar && page !== currentPage) {
          closePage(page, 'none')
        }
      })
      removePage(currentPage)
      // 延迟执行避免iOS应用退出
      setTimeout(() => {
        if (currentPage!.$page.openType === 'redirectTo') {
          closeWebview(currentPage!.$getAppWebview!(), ANI_CLOSE, ANI_DURATION)
        } else {
          closeWebview(currentPage!.$getAppWebview!(), 'auto')
        }
      }, 100)
    } else {
      callOnHide = true
    }
  }

  let tabBarPage: ComponentPublicInstance | undefined
  // 查找当前 tabBarPage，且设置 visible
  getAllPages().forEach((page) => {
    if ('/' + page.route === path) {
      if (!page.$.__isActive) {
        // 之前未显示
        callOnShow = true
      }
      page.$.__isActive = true
      tabBarPage = page
    } else {
      if (page.__isTabBar) {
        page.$.__isActive = false
      }
    }
  })
  // 相同tabBar页面
  if (currentPage === tabBarPage) {
    callOnHide = false
  }
  if (currentPage && callOnHide) {
    invokeHook(currentPage, ON_HIDE)
  }
  return new Promise((resolve) => {
    if (tabBarPage) {
      const webview = tabBarPage!.$getAppWebview!()
      webview.show('none')
      // 等visible状态都切换完之后，再触发onShow，否则开发者在onShow里边 getCurrentPages 会不准确
      if (callOnShow && !(webview as any).__preload__) {
        invokeHook(tabBarPage, ON_SHOW)
      }
      setStatusBarStyle()
      resolve(undefined)
    } else {
      showWebview(
        registerPage({
          url,
          path,
          query,
          openType: 'switchTab',
        }),
        'none',
        0,
        () => {
          setStatusBarStyle()
          resolve(undefined)
        },
        70
      )
    }
  })
}