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
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
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

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to{" "}
            <span className="text-indigo-600">BaseHealth</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Personalized health starts here. Evidence-based screenings. Expert second opinions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center items-center max-w-4xl mx-auto">
            <Button 
              asChild 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg rounded-lg font-medium transition-colors w-full h-16 flex items-center justify-center"
            >
              <Link href="/screening" className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Start AI Screening
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg rounded-lg font-medium transition-colors w-full h-16 flex items-center justify-center"
            >
              <Link href="/second-opinion" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Get Second Opinion
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-8 py-4 text-lg rounded-lg font-medium transition-colors w-full h-16 flex items-center justify-center"
            >
              <Link href="/clinical-trials" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Clinical Trials
              </Link>
            </Button>
          </div>

          {/* healthdb.ai Integration Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contribute to Healthcare Research
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join healthdb.ai to participate as a patient and contribute your health data to advance medical research and improve healthcare for everyone.
            </p>
            <Button 
              asChild 
              variant="outline" 
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-6 py-2 rounded-lg font-medium"
            >
              <a href="https://healthdb.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Join healthdb.ai as Patient
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
