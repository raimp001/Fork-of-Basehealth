"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Copy, ExternalLink, Wallet } from "lucide-react"

export function SimplifiedWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Transactions are loaded from the blockchain when wallet is connected
  const transactions: {
    id: string
    type: string
    amount: string
    usdAmount: string
    recipient?: string
    sender?: string
    date: string
    status: string
    txHash: string
  }[] = []

  const handleConnect = () => {
    setIsConnecting(true)

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
    }, 1500)
  }

  const formatAddress = (address: string) => {
    return address
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Crypto Wallet</h1>

      {isConnected ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">0.125 ETH</p>
                  <p className="text-muted-foreground">≈ $250.00 USD</p>
                </div>
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" alt="ETH" />
                  <AvatarFallback>ETH</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex items-center mt-4 space-x-2">
                <Button variant="outline" className="flex-1">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="outline" className="flex-1">
                  <ArrowDownRight className="mr-2 h-4 w-4" />
                  Receive
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Wallet Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <code className="text-xs font-mono">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is your Base network wallet address for receiving payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <span className="text-xs">View All</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="healthcare">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="healthcare" className="space-y-4 pt-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-start justify-between py-2">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${tx.type === "outgoing" ? "bg-red-100" : "bg-green-100"}`}>
                          {tx.type === "outgoing" ? (
                            <ArrowUpRight
                              className={`h-4 w-4 ${tx.type === "outgoing" ? "text-red-600" : "text-green-600"}`}
                            />
                          ) : (
                            <ArrowDownRight
                              className={`h-4 w-4 ${tx.type === "outgoing" ? "text-red-600" : "text-green-600"}`}
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {tx.type === "outgoing" ? `To: ${tx.recipient}` : `From: ${tx.sender}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                          <div className="flex items-center mt-1">
                            <p className="text-xs font-mono mr-2">{formatAddress(tx.txHash)}</p>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-medium ${tx.type === "outgoing" ? "text-red-600" : "text-green-600"}`}>
                          {tx.type === "outgoing" ? "-" : "+"}
                          {tx.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.usdAmount}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="all" className="pt-4">
                  <p className="text-center text-muted-foreground py-8">All transactions will appear here</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your Ethereum wallet to manage healthcare payments</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="bg-muted p-6 rounded-full mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              Connect your Ethereum wallet to make payments for healthcare services, track your transaction history, and
              manage your healthcare spending.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full max-w-xs">
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Don't have a wallet?{" "}
              <a href="#" className="text-primary hover:underline">
                Learn how to get started
              </a>
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
