import { Outlet } from 'react-router-dom';
import ThemeContextProvider from '@/contexts/theme-context'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { SWRConfig } from 'swr'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom';

function Layout() {
  const { isLoading, checkAuth } = useAuth();
  const { t } = useTranslation();
  const location = useLocation()
  const isSignInPage = location.pathname === '/signin';

  // 每次刷新都重新验证身份
  useEffect(() => {
    // 登录页面不需要验证，非登录页才执行 checkAuth
    if (!isSignInPage) {
      checkAuth();
    }
  }, [isSignInPage, checkAuth]);

  // 加载中状态（仅在非登录页显示）
  if (isLoading && !isSignInPage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">{t('common.layout.authenticating')}</span>
      </div>
    );
  }

  return (
    <SWRConfig
      value={{
        // 全局配置选项
        revalidateOnFocus: false, // 窗口聚焦时不重新验证
        revalidateOnReconnect: true, // 网络重连时重新验证
        revalidateIfStale: true, // 数据过期时重新验证
        dedupingInterval: 2000, // 去重间隔时间（毫秒）
        focusThrottleInterval: 5000, // 聚焦节流间隔
        errorRetryCount: 3, // 错误重试次数
        errorRetryInterval: 1000, // 错误重试间隔
        loadingTimeout: 3000, // 加载超时时间
      }}
    >
      <ThemeContextProvider>
        <div className="h-screen w-full bg-bg-primary">
          <Outlet />
        </div>
      </ThemeContextProvider>
    </SWRConfig>
  )
}

export default Layout
