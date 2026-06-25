import './globals.css'
import SupabaseErrorBoundary from './components/SupabaseErrorBoundary'

export const metadata = {
  title: 'Rotina App',
  description: 'Gestão de rotina diária',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-900 text-white">
        <SupabaseErrorBoundary>
          {children}
        </SupabaseErrorBoundary>
      </body>
    </html>
  )
}