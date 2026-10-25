import { Darker_Grotesque } from 'next/font/google'
import './landing.css'

const grotesque = Darker_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-grotesque',
})

export default function MarketingLayout({ children }) {
  return (
    <div className={`lp ${grotesque.variable}`} data-theme="light">
      {children}
    </div>
  )
}