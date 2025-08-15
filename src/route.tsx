import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/views/layout'
import Home from '@/views/index'
import SignIn from '@/views/signin'
import Setting from '@/views/setting'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'setting',
        element: <Setting />,
      },
    ],
  },
  {
    path: 'signin',
    element: <SignIn />,
  },
]);

// 路由提供者组件
export function AppRouter() {
  return (
    <RouterProvider 
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  );
}