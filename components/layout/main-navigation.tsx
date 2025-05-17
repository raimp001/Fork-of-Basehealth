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
import { Menu, Home, Search, Calendar, MessageSquare, Activity, Wallet } from "lucide-react"

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
  ]

  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/">
              <span className="sr-only">Basehealth</span>
              <img
                className="h-8 w-auto sm:h-10"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="Basehealth"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="px-2 py-6">
                  <Link href="/" className="flex items-center mb-6" onClick={() => setIsOpen(false)}>
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                      alt="Basehealth"
                    />
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {mobileLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="mr-3 h-5 w-5 text-indigo-600" />
                        {link.name}
                      </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 mt-2 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900 mr-8"
              >
                Sign in
              </Link>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
