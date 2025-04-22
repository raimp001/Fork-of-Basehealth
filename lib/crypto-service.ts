// Simplify the crypto service to just handle wallet connections
export interface WalletConnection {
  address: string
  connected: boolean
  chainId: string
}

// Mock wallet connection
export async function connectWallet(): Promise<WalletConnection> {
  // Simulate connection delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Return mock wallet connection
  return {
    address: "0x" + Math.random().toString(16).slice(2, 10) + "...",
    connected: true,
    chainId: "0x1",
  }
}

// Check if wallet is connected
export async function isWalletConnected(): Promise<boolean> {
  // Simulate check delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Random result for demo purposes
  return Math.random() > 0.3
}

export interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
}

// Mock crypto prices
const mockCryptoPrices: CryptoPrice[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 65000,
    change24h: 2.5,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3500,
    change24h: 1.8,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    price: 1,
    change24h: 0.01,
  },
  {
    symbol: "DAI",
    name: "Dai",
    price: 1,
    change24h: 0.02,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 150,
    change24h: 4.2,
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.12,
    change24h: -1.5,
  },
]

export async function getAllCryptoPrices(): Promise<CryptoPrice[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Add some random variation to prices
  return mockCryptoPrices.map((crypto) => ({
    ...crypto,
    price: crypto.price * (1 + (Math.random() * 0.02 - 0.01)), // +/- 1%
    change24h: crypto.change24h + (Math.random() * 1 - 0.5), // +/- 0.5%
  }))
}

export async function getCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const crypto = mockCryptoPrices.find((c) => c.symbol === symbol)
  if (!crypto) return null

  // Add some random variation
  return {
    ...crypto,
    price: crypto.price * (1 + (Math.random() * 0.02 - 0.01)), // +/- 1%
    change24h: crypto.change24h + (Math.random() * 1 - 0.5), // +/- 0.5%
  }
}
