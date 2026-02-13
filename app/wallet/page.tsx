"use client"

import { SimplifiedWalletConnect } from "@/components/blockchain/simplified-wallet-connect"
import { InsuranceClaims } from "@/components/blockchain/insurance-claims"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WalletPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Wallet Connection</h1>
      <SimplifiedWalletConnect />

      <div className="mt-8">
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payments">
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold mb-4">Try Our New OnchainKit Integration</h2>
              <p className="text-muted-foreground mb-4">
                Experience our enhanced wallet connection powered by Base's OnchainKit
              </p>
              <Button asChild>
                <Link href="/wallet/onchain">Try OnchainKit Wallet</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="insurance">
            <div className="mt-4">
              <InsuranceClaims />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
