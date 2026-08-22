import { ToastProvider } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { initMockStore } from '@/services/mockStore'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuth()

  useEffect(() => {
    initMockStore()
    initialize()
  }, [initialize])

  return <>{children}</>
}

export default function App() {
  return (
    <ToastProvider>
      <AppBootstrap>
        <RouterProvider router={router} />
      </AppBootstrap>
    </ToastProvider>
  )
}
