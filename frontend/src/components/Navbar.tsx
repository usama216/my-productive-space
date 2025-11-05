// src/components/Navbar.tsx - Updated for client-side auth
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Menu, X, ChevronDown, Loader2, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

type Section = {
  name: string
  href?: string
  children?: { name: string; href: string }[]
}

const sections: Section[] = [
  { name: 'Book Now', href: '/#BookNow' },
  { name: 'About', href: '/#About' },
  { name: 'Locations', href: '/#Locations' },
  { name: 'Pricing', href: '/#Pricing' },
  {
    name: 'Co-Infos',
    children: [
      { name: 'Co-Working Solutions', href: '/cowork' },
      { name: 'Co-Tutoring Solutions', href: '/colearn' },
      { name: 'Co-Students Solutions', href: '/costudy' },
    ],
  },
  {
    name: 'More',
    children: [
      { name: 'Why Us', href: '/#WhyUs' },
      { name: 'Booking Guide', href: '/#BookingGuide' },
      { name: 'Feedback', href: '/#Feedback' },
      { name: 'FAQ', href: '/#FAQ' },
    ],
  },
  { name: 'Contact Us', href: '/#ContactUs' },
]

export default function Navbar() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, databaseUser, loading: authLoading, isLoggedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null)

  const avatarUrl = user?.user_metadata?.avatar_url || '/profilepic/default-avatar.png'

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      // Clear local storage immediately for faster UX
      localStorage.removeItem('auth_user')
      localStorage.removeItem('database_user')
      
      // Navigate first
      router.push('/?toastType=logOut')
      
      // Then sign out in background
      await supabase.auth.signOut()
    } catch (error: any) {
      console.error('Logout error:', error)
      // Still navigate even if signOut fails
      router.push('/?toastType=logOut')
    } finally {
      setLogoutLoading(false)
    }
  }



  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#efefe7]/95 backdrop-blur-md z-50 border-b border-gray-200/50 py-5">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div className="flex-shrink-0">
            <Link href="/" className="group flex flex-col items-start transition-all duration-300">
              <Image
                src='/mock_img/logo5.png'
                alt="MyProductiveSpace logo"
                width={180}
                height={24}
                priority
                className="w-32 sm:w-40 md:w-44 h-auto group-hover:scale-105 transition-transform duration-300"
              />
              <span className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                co-work • co-learn • co-study
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {sections.map((sec) =>
              sec.children ? (
                <div
                  key={sec.name}
                  className="relative group/nav"
                  onMouseEnter={() => setOpenDropdown(sec.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-white/60 rounded-lg transition-all duration-300 flex items-center gap-1">
                    {sec.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Bridge area - invisible div to prevent gap */}
                  <div className="absolute top-full left-0 w-full h-2"></div>
                  
                  {/* Dropdown Content */}
                  {openDropdown === sec.name && (
                    <div className="absolute top-full left-0 pt-2 min-w-[220px] z-50">
                      <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-lg overflow-hidden">
                        {sec.children.map((child) => (
                          <a
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={sec.name}
                  href={sec.href}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-white/60 rounded-lg transition-all duration-300"
                >
                  {sec.name}
                </a>
              )
            )}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {authLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-gray-600" />
            ) : isLoggedIn ? (
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('profile')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/60 rounded-xl transition-all duration-300 group">
                  <div className="relative">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-orange-600 group-hover:border-orange-700 transition-colors"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#efefe7]"></div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-gray-900 block">
                      {databaseUser?.name || user?.user_metadata?.firstName || "User"}
                    </span>
                    <span className="text-xs text-gray-600">
                      {databaseUser?.memberType || 'Member'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-orange-600" />
                </button>
                
                {/* Bridge area - invisible div to prevent gap */}
                <div className="absolute top-full right-0 w-full h-2"></div>
                
                {/* Profile Dropdown */}
                {openDropdown === 'profile' && (
                  <div className="absolute top-full right-0 pt-2 min-w-[220px] z-50">
                    <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-lg overflow-hidden">
                      {databaseUser?.memberType === 'ADMIN' && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-3"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link 
                        href="/dashboard#overview" 
                        className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-3"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                      >
                        {logoutLoading ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4" />
                            Logout
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  asChild
                  className="font-semibold hover:bg-white/60 hover:text-orange-600 transition-all"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
                  asChild
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/60 rounded-lg transition-all duration-300"
            onClick={() => {
              setMobileOpen((o) => !o)
              if (mobileOpen) {
                setMobileDropdownOpen(null)
              }
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="px-6 py-4 space-y-1">
            {sections.map((sec) =>
              sec.children ? (
                <div key={sec.name} className="border-b border-gray-200 pb-2 mb-2">
                  <button 
                    onClick={() => setMobileDropdownOpen(mobileDropdownOpen === sec.name ? null : sec.name)}
                    className="w-full flex items-center justify-between py-2 px-3 font-semibold text-gray-900 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                  >
                    <span>{sec.name}</span>
                    <ChevronDown 
                      className={`h-4 w-4 text-orange-600 transition-transform duration-300 ${
                        mobileDropdownOpen === sec.name ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {mobileDropdownOpen === sec.name && (
                    <div className="pl-4 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                      {sec.children.map((child) => (
                        <a
                          key={child.name}
                          href={child.href}
                          className="block py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:translate-x-1 transition-all"
                          onClick={() => {
                            setMobileOpen(false)
                            setMobileDropdownOpen(null)
                          }}
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={sec.name}
                  href={sec.href}
                  className="block py-2 font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {sec.name}
                </a>
              )
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-3 mt-2 border-t border-gray-200">
              {authLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin h-6 w-6 text-orange-600" />
                </div>
              ) : isLoggedIn ? (
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-orange-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {databaseUser?.name || user?.user_metadata?.firstName || "User"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {databaseUser?.memberType || 'Member'}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {databaseUser?.memberType === 'ADMIN' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => {
                        router.push('/admin')
                        setMobileOpen(false)
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => {
                      router.push('/dashboard#overview')
                      setMobileOpen(false)
                    }}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                  >
                    {logoutLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Logout
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full font-semibold border-2 border-gray-300 hover:border-orange-600 hover:text-orange-600"
                    onClick={() => {
                      router.push('/login')
                      setMobileOpen(false)
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                    onClick={() => {
                      router.push('/sign-up')
                      setMobileOpen(false)
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}