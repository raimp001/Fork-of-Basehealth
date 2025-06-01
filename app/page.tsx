"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Users, Wallet, UserPlus, Database, Search, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { getBlockchainService } from "@/services/blockchain-service"

export default function HomePage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const blockchainService = getBlockchainService()

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (blockchainService.isWalletConnected()) {
      const address = await blockchainService.getWalletAddress()
      setWalletAddress(address)
      setIsWalletConnected(true)
    }
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const connected = await blockchainService.connect()
      if (connected) {
        const address = await blockchainService.getWalletAddress()
        setWalletAddress(address)
        setIsWalletConnected(true)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please make sure you have a Web3 wallet installed.")
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 backdrop-blur-sm bg-white/90 border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
            BaseHealth
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Button 
              asChild 
              variant="ghost" 
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                HealthDB.ai
              </a>
            </Button>
            <Link 
              href="/patient-portal" 
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Patient Portal
            </Link>
            <Link 
              href="/settings" 
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Settings
            </Link>
          </nav>
          
          {/* Wallet and Auth Section */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isWalletConnected 
                  ? 'text-green-600 border-green-500 hover:bg-green-50' 
                  : 'text-indigo-600 border-indigo-500 hover:bg-indigo-50'
              }`}
              onClick={handleConnectWallet}
              disabled={isConnecting}
            >
              <Wallet className="h-4 w-4" /> 
              {isConnecting ? "Connecting..." : 
               isWalletConnected ? formatAddress(walletAddress!) : "Connect Wallet"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/providers/signup" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Provider Sign Up
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Portal
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative flex flex-col items-center justify-center px-4 py-24 min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Advanced Healthcare Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                BaseHealth
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Personalized health starts here. Evidence-based screenings, expert second opinions, 
              and cutting-edge clinical trials—all in one platform.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center items-center max-w-4xl mx-auto mb-16">
              <Button 
                asChild 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full h-20 flex items-center justify-center"
              >
                <Link href="/screening" className="flex items-center gap-3">
                  <Activity className="h-6 w-6" />
                  <span>Start AI Screening</span>
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 px-8 py-6 text-lg rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full h-20 flex items-center justify-center"
              >
                <Link href="/second-opinion" className="flex items-center gap-3">
                  <Users className="h-6 w-6" />
                  <span>Get Second Opinion</span>
                </Link>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 px-8 py-6 text-lg rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full h-20 flex items-center justify-center"
              >
                <Link href="/clinical-trials" className="flex items-center gap-3">
                  <Search className="h-6 w-6" />
                  <span>Find Clinical Trials</span>
                </Link>
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Health</h3>
                <p className="text-gray-600">Advanced AI algorithms for personalized health screening and recommendations</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Network</h3>
                <p className="text-gray-600">Connect with verified healthcare providers and get professional second opinions</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Clinical Research</h3>
                <p className="text-gray-600">Access cutting-edge clinical trials and contribute to medical research</p>
              </div>
            </div>

            {/* healthdb.ai Integration Section */}
            <div className="bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-100 rounded-3xl p-8 border border-indigo-200 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contribute to Healthcare Research
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg">
                Join HealthDB.ai to participate as a patient and contribute your health data to advance medical research and improve healthcare for everyone.
              </p>
              <Button 
                asChild 
                variant="outline" 
                className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
              >
                <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Join HealthDB.ai as Patient
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add custom CSS for grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  )
}
