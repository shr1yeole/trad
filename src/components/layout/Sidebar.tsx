'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  BookOpen, 
  LineChart, 
  BrainCircuit, 
  Bot, 
  Target, 
  CalendarDays, 
  Settings 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Trade Journal', href: '/journal', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Psychology', href: '/psychology', icon: BrainCircuit },
  { name: 'AI Coach', href: '/ai-coach', icon: Bot },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  onNavItemClick?: () => void
}

export function Sidebar({ onNavItemClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-sidebar border-r border-sidebar-border px-4 py-6 lg:border-r-0">
      <div className="flex items-center mb-8 px-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(173,198,255,0.4)]">
          <BrainCircuit className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">TradeMind AI</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavItemClick}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(173,198,255,0.05)]' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
