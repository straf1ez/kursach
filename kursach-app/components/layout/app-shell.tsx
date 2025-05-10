"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Globe, User, Award, Settings, LogOut, Menu, X, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/utils/auth/client"

interface AppShellProps {
  children: React.ReactNode
  user: any
}

export function AppShell({ children, user }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Получаем display_name и avatar_url только если user есть
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .single()
        if (profile && profile.display_name) {
          setDisplayName(profile.display_name)
        } else {
          setDisplayName("")
        }
        if (profile && profile.avatar_url) {
          setAvatarUrl(profile.avatar_url)
        } else {
          setAvatarUrl("")
        }
      }
    }
    fetchProfile()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  if (pathname.includes("/auth")) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - desktop always visible, mobile conditional */}
      <div
        className={cn(
          "bg-white shadow-md fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-40",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isSidebarCollapsed ? "md:w-20" : "md:w-64", // Adjust width based on collapsed state
          "w-64", // Default width for mobile
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and app name */}
          <div className="p-4 border-b flex items-center space-x-3">
            <img src="/simple-gray-globe.png" alt="Логотип Страны" className="w-8 h-8" />
            {!isSidebarCollapsed && <h1 className="text-xl font-bold">Страны</h1>}
          </div>

          {/* User info */}
          {user && (
            <div className={cn("p-4 border-b", isSidebarCollapsed ? "flex justify-center" : "")}>
              {isSidebarCollapsed ? (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User size={20} className="text-green-600" />
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User size={20} className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-xs text-gray-500">Игрок</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavLink href="/" icon={<Globe size={20} />} active={pathname === "/"} collapsed={isSidebarCollapsed}>
              Играть
            </NavLink>
            <NavLink
              href="/stats"
              icon={<Award size={20} />}
              active={pathname === "/stats"}
              collapsed={isSidebarCollapsed}
            >
              Статистика
            </NavLink>
            <NavLink
              href="/account"
              icon={<Settings size={20} />}
              active={pathname === "/account"}
              collapsed={isSidebarCollapsed}
            >
              Аккаунт
            </NavLink>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className={cn(
                "w-full text-red-600 hover:text-red-700 hover:bg-red-50",
                isSidebarCollapsed ? "justify-center px-0" : "justify-start",
              )}
              onClick={handleLogout}
            >
              <LogOut size={20} className={isSidebarCollapsed ? "" : "mr-2"} />
              {!isSidebarCollapsed && "Выйти"}
            </Button>
          </div>

          {/* Add toggle button at the bottom */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-center"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - adjust margin based on sidebar state */}
      <div className={cn("flex-1", isSidebarCollapsed ? "md:ml-20" : "md:ml-64")}>
        <main className="p-4 md:p-8 max-w-4xl mx-auto">{children}</main>
      </div>
    </div>
  )
}

// Navigation link component
interface NavLinkProps {
  href: string
  icon: React.ReactNode
  active: boolean
  collapsed?: boolean
  children: React.ReactNode
}

function NavLink({ href, icon, active, collapsed, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center p-3 rounded-md transition-colors",
        active ? "bg-green-50 text-green-600" : "text-gray-700 hover:bg-gray-100",
        collapsed ? "justify-center" : "space-x-3",
      )}
    >
      {icon}
      {!collapsed && <span>{children}</span>}
      {!collapsed && <ChevronRight size={16} className="ml-auto" />}
    </Link>
  )
}
