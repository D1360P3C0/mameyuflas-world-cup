'use client'

/**
 * Providers globales de la aplicación MWC.
 *
 * Wrap de todos los providers necesarios en un solo componente:
 * - TanStack Query (QueryClientProvider)
 * - TanStack Query DevTools (solo en development)
 *
 * Zustand no necesita provider — sus stores se crean directamente.
 *
 * Uso: importado en app/layout.tsx para envolver toda la app.
 */
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Con SSR queremos evitar el refetch inmediato al montar
        staleTime: 60 * 1000, // 1 minuto
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: crear siempre un nuevo QueryClient
    return makeQueryClient()
  } else {
    // Browser: reusar el mismo QueryClient para evitar recrearlo en cada render
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
