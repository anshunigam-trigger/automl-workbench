import './globals.css'

export const metadata = {
  title: 'AutoBench — No-Code AutoML Platform',
  description: 'Upload any CSV, pick ML models, and compare real accuracy scores automatically.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
