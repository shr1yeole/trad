'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { UserMenu } from '@/components/layout/UserMenu'
import { Bell, Search, Menu, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Drawer Sidebar Panel */}
          <div className="relative flex w-64 max-w-[260px] flex-col bg-sidebar border-r border-sidebar-border z-10 animate-in slide-in-from-left duration-250">
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/5"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
            <Sidebar onNavItemClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-4 sm:px-6 lg:px-8 backdrop-blur-md bg-background/80 z-10">
          <div className="flex flex-1 items-center max-w-md">
            {/* Hamburger Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mr-2 h-9 w-9 lg:hidden hover:bg-white/5"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
            
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search trades, notes..." 
                className="w-full pl-9 bg-[#111827]/60 border-white/10 h-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.8)]" />
            </Button>
            <UserMenu />
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-0 max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
