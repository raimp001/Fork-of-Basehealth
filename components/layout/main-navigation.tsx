"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Search, Calendar, MessageSquare, Activity, Wallet, Dashboard, Hospital, Users } from "lucide-react"

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const solutions = [
    {
      title: "Analytics",
      description: "Get a better understanding of where your traffic is coming from.",
      href: "#",
    },
    {
      title: "Engagement",
      description: "Speak directly to your customers in a more meaningful way.",
      href: "#",
    },
    {
      title: "Security",
      description: "Your customers' data will be safe and secure.",
      href: "#",
    },
    {
      title: "Integrations",
      description: "Connect with third-party tools that you're already using.",
      href: "#",
    },
    {
      title: "Automations",
      description: "Build strategic funnels that will drive your customers to convert",
      href: "#",
    },
    {
      title: "OnchainKit",
      description: "Connect with blockchain wallets and manage crypto payments.",
      href: "/wallet/onchain",
    },
  ]

  const mainLinks = [
    { name: "Product", href: "#" },
    { name: "Features", href: "#" },
    { name: "Marketplace", href: "#" },
    { name: "Company", href: "#" },
  ]

  const mobileLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Find Providers", href: "/providers/search", icon: Search },
    { name: "Appointments", href: "/appointment/request", icon: Calendar },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Health Dashboard", href: "/health/dashboard", icon: Activity },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Dashboard", href: "/dashboard", icon: Dashboard },
    { name: "Retrieve Patient Info", href: "/portal/retrieve-pt-info", icon: Hospital },
    { name: "Patients", href: "/patients", icon: Users },
  ]

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors">
              <span className="sr-only">BaseHealth</span>
              BaseHealth
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-700 hover:text-slate-900">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="px-2 py-6">
                  <Link href="/" className="flex items-center mb-6 text-2xl font-bold text-slate-900" onClick={() => setIsOpen(false)}>
                    BaseHealth
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {mobileLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="mr-3 h-5 w-5 text-slate-600" />
                        {link.name}
                      </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-base font-medium rounded-md hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 mt-2 text-base font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation - simplified */}
          <div className="hidden md:flex md:items-center md:justify-between md:flex-1">
            {/* No navigation menu, just sign in/up */}
            <div className="flex items-center">
              <Link
                href="/login"
                className="whitespace-nowrap text-base font-medium text-slate-600 hover:text-slate-900 mr-8"
              >
                Sign in
              </Link>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
