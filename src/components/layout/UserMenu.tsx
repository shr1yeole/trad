'use client'

import { useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthHook } from '@/hooks/useAuth'

export function UserMenu() {
  const { user, logout } = useAuthHook()
  const [isOpen, setIsOpen] = useState(false)

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : null

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 rounded-full bg-muted border border-white/10 overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : initials ? (
          <span className="text-xs font-medium">{initials}</span>
        ) : (
          <User className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-white/10 z-50 py-1">
            <div className="px-4 py-2 border-b border-white/5">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
