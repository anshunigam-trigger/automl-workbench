import { LayoutGrid, FlaskConical, Database, Layers, FileBarChart, GitCompare } from 'lucide-react'

// Single source of truth for header tabs and rail icons. Adjust hrefs to your routes.
export const NAV = [
  { href: '/dashboard',   label: 'Overview',    Icon: LayoutGrid },
  { href: '/experiments', label: 'Experiments', Icon: FlaskConical },
  { href: '/datasets',    label: 'Datasets',    Icon: Database },
  { href: '/models',      label: 'Models',      Icon: Layers },
  { href: '/reports',     label: 'Reports',     Icon: FileBarChart },
  { href: '/compare',     label: 'Compare',     Icon: GitCompare },
]