import './globals.css'
import Sidebar from '@/components/Sidebar'
import NeuralBackground from '@/components/NeuralBackground'

export const metadata = {
  title: 'AutoBench — No-Code AutoML Platform',
  description: 'Upload any CSV, pick ML models, and compare real accuracy scores automatically.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NeuralBackground />
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}