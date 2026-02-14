"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
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
  Wallet,
  Bookmark,
  Bot
} from "lucide-react"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SignInWithBase } from "@/components/auth/sign-in-with-base"

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/screening', label: 'Screenings', icon: Activity },
  { href: '/providers/search', label: 'Find care', icon: Search },
  { href: '/clinical-trials', label: 'Clinical trials', icon: FlaskConical },
  { href: '/agents', label: 'Agents', icon: Brain },
  { href: '/providers/search?bounty=true', label: 'Caregivers', icon: Heart },
  { href: '/provider/signup', label: 'Join as provider', icon: User, badge: 'New' },
]

const userMenuItems = [
  { href: '/patient-portal', label: 'Portal', icon: User },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/wallet', label: 'Wallet', icon: DollarSign },
  { href: '/payment/base', label: 'Payments', icon: Wallet, badge: 'New' },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const adminMenuItems = [
  { href: '/admin/applications', label: 'Application Reviews', icon: Bell, badge: 'Admin' },
  { href: '/admin/providers', label: 'Provider Management', icon: User },
  { href: '/admin/analytics', label: 'Analytics', icon: Activity },
  { href: '/treasury', label: 'Treasury', icon: DollarSign, badge: 'Ops' },
]

const quickActions = [
  { href: '/agents', label: 'OpenClaw agents', icon: Brain, badge: 'New' },
  { href: '/chat', label: 'Agent console', icon: Bot, badge: null },
  { href: '/second-opinion', label: 'Expert review', icon: Activity, badge: 'New' },
]

const desktopNavigationItems = [
  { href: '/screening', label: 'Screenings' },
  { href: '/providers/search', label: 'Find care' },
  { href: '/clinical-trials', label: 'Clinical trials' },
  { href: '/agents', label: 'Agents' },
]

const mobileBottomItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/screening', label: 'Screenings', icon: Activity },
  { href: '/agents', label: 'Agents', icon: Brain },
  { href: '/chat', label: 'Chat', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border backdrop-blur ${
          scrolled ? "bg-background/95 shadow-md" : "bg-background/80 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <div className="flex items-center gap-8 lg:gap-12">
              <Link 
                href="/" 
                className="text-xl md:text-2xl font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity duration-200"
              >
                BaseHealth
              </Link>
              
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                {desktopNavigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      pathname === item.href
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/saved"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Saved items"
              >
                <Bookmark className="h-5 w-5" />
              </Link>
              <NotificationCenter />
              <ThemeToggle />
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              >
                <Link href="/provider/signup">Become a Provider</Link>
              </Button>
              <SignInWithBase className="h-9" />
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 bg-background">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-5 border-b border-border">
                    <span className="text-lg font-bold text-foreground">Menu</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="flex-1 py-6 overflow-y-auto">
                    <div className="px-4 space-y-1">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            pathname === item.href
                              ? "bg-muted text-foreground font-semibold shadow-sm"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-foreground" : "text-muted-foreground"}`} />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="px-4 mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Quick Actions
                        </p>
                        <div className="space-y-1">
                          {quickActions.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium text-foreground">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-xs font-semibold">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      <div className="px-4 mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Account
                        </p>
                        <div className="space-y-1">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium text-foreground">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Admin Section */}
                      <div className="px-4 pt-6 border-t border-border">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Administration
                        </p>
                        <div className="space-y-1">
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium text-foreground">{item.label}</span>
                              </div>
                              {item.badge && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs font-semibold">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </nav>
                  
                  <div className="p-5 border-t border-border bg-muted/20 space-y-3">
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full h-11 border-2 border-blue-200 hover:border-blue-300 bg-blue-50 text-blue-900 font-semibold hover:bg-blue-100 transition-all duration-200" 
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/provider/signup">Become a Provider</Link>
                    </Button>
                    <div className="flex justify-center" onClick={() => setIsOpen(false)}>
                      <SignInWithBase className="w-full h-11" />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {mobileBottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative ${pathname === item.href ? 'scale-110' : ''} transition-transform duration-200`}>
                <item.icon className={`h-5 w-5 ${pathname === item.href ? "text-foreground" : ""}`} />
                {pathname === item.href && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </div>
              <span className={`text-xs font-medium ${pathname === item.href ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
