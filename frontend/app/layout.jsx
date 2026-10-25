import './globals.css'

export const metadata = {
  title: 'AutoBench — No-Code AutoML Platform',
  description: 'Upload a CSV, compare machine learning models, and get a ranked leaderboard. No code required.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}