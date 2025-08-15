import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 导入 i18n 配置
import './i18n/i18next-config';
import { AppRouter } from './route';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
