"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { components } from "@/lib/design-system"
// Removed wallet button import to fix client-side errors
import { 
  Menu, 
  X, 
  Activity, 
  Search, 
  FlaskConical, 
  Heart,
  Home,
  User,
  Settings,
  Brain,
  DollarSign,
  CreditCard,
  Bell,
  Wallet
} from "lucide-react"

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/screening', label: 'Screening', icon: Activity },
  { href: '/providers/search', label: 'Find Care', icon: Search },
  { href: '/clinical-trials', label: 'Research', icon: FlaskConical },
  { href: '/providers/search?bounty=true', label: 'Caregivers', icon: Heart },
]

const userMenuItems = [
  { href: '/patient-portal', label: 'Dashboard', icon: User },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/wallet', label: 'Wallet', icon: DollarSign },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const adminMenuItems = [
  { href: '/admin/applications', label: 'Application Reviews', icon: Bell, badge: 'Admin' },
  { href: '/admin/providers', label: 'Provider Management', icon: User },
  { href: '/admin/analytics', label: 'Analytics', icon: Activity },
]

const quickActions = [
  { href: '/second-opinion', label: 'Medical Bounty', icon: Brain, badge: 'New' },
  { href: '/chat', label: 'Health Chat', icon: Activity, badge: null },
]

export function MinimalNavigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Desktop Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-white/80 backdrop-blur-md'
      } border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-semibold text-gray-900">
                BaseHealth
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                {navigationItems.slice(1, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm transition-colors ${
                      pathname === item.href
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className={components.button.ghost}>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className={components.button.primary}>
                <Link href="/register">Get started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="text-lg font-semibold">Menu</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="flex-1 py-4">
                    <div className="px-4 space-y-1">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            pathname === item.href
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="px-4 mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Quick Actions
                        </p>
                        <div className="space-y-1">
                          {quickActions.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className={components.badge.primary}>
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      <div className="px-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Account
                        </p>
                        <div className="space-y-1">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Admin Section */}
                      <div className="px-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Administration
                        </p>
                        <div className="space-y-1">
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className={components.badge.error}>
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </nav>
                  
                  <div className="p-4 border-t space-y-3">
                    <Button asChild variant="outline" className={`w-full ${components.button.secondary}`} onClick={() => setIsOpen(false)}>
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild className={`w-full ${components.button.primary}`} onClick={() => setIsOpen(false)}>
                      <Link href="/register">Get started</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                pathname === item.href
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
