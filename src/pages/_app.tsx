import {useState} from 'react'
import AppBar from '@/components/app-bar'
import {queryClient} from '@/lib/utils'
import '@/styles/global.css'
import {QueryClientProvider} from '@tanstack/react-query'
import type {AppProps} from 'next/app'
import {Inter} from 'next/font/google'
import {SearchDialog} from '@/components/search-dialog'

const inter = Inter({subsets: ['latin']})

export default function App({Component, pageProps}: AppProps) {
  const [openSearchDialog, setOpenSearchDialog] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <AppBar onOpenSearch={() => setOpenSearchDialog(true)} />
      <main className={`min-h-screen ${inter.className}`}>
        <Component {...pageProps} />
      </main>
      <SearchDialog
        open={openSearchDialog}
        onOpenChange={setOpenSearchDialog}
      />
    </QueryClientProvider>
  )
}
