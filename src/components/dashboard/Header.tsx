import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>
        <Avatar className="w-9 h-9 cursor-pointer">
          <AvatarFallback className="text-sm">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
