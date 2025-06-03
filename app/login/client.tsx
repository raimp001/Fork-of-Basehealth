"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"
import { Mail, Lock, ArrowRight, Shield, Heart } from "lucide-react"

export default function LoginClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Handle login logic here
    console.log("Login attempt with:", { email, password })
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-md relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              BaseHealth
            </h1>
          </Link>
          <p className="text-gray-600">Healthcare platform for the modern world</p>
          <Badge variant="secondary" className="mt-3 bg-indigo-100 text-indigo-700 border-indigo-200">
            Secure Login
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 border-0 bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="text-sm text-right">
                <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading || !email || !password}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-white font-medium transition-all duration-200 hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
              
              <div className="text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium transition-colors">
                  Create Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
            <Shield className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Secure</p>
          </div>
          <div className="p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">HIPAA Compliant</p>
          </div>
          <div className="p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-white/20">
            <Mail className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">24/7 Support</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 BaseHealth. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
