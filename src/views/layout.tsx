import { Outlet } from 'react-router-dom';
import Account from '@/components/base/account'
import Schedule from '@/components/base/canlendar'
import ThemeContextProvider from '@/contexts/theme-context'
import { ToastProvider } from '@/components/base/toast'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { SWRConfig } from 'swr'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/use-auth-store';
import notebookLogo from '@/assets/notebook.svg'
import Logo from '@/assets/logo.svg'
import { useNavigate } from 'react-router-dom'

function Layout() {
  const { isLoading, checkAuth } = useAuth();
  const { user } = useAuthStore()
  const { t } = useTranslation();
  const navigate = useNavigate()

  // 每次刷新都重新验证身份
  useEffect(() => {
    checkAuth();
  }, []);

  // 加载中状态
  if (isLoading) {
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
      <ToastProvider>
        <ThemeContextProvider>
          <div className="flex flex-col h-screen w-full">
            <div className="w-full h-16 flex items-center justify-between px-2 header-gradient" >
              <div className="flex items-center py-2 h-full" onClick={() => navigate('/')}>
                <img src={Logo} alt="logo" className="h-12 w-12 pt-1"/>
                <img src={notebookLogo} alt="logo" className="h-full w-28"/>
              </div>
              <div className="flex items-center">
                <div><Schedule/></div>
                <Account data={{
                  name: user?.name,
                }} />
              </div>
              
            </div>
            <div className='flex-1'>
              <Outlet />
            </div>
          </div>
        </ThemeContextProvider>
      </ToastProvider>
    </SWRConfig>
  )
}

export default Layout
