import { ethers } from "ethers"

// Add TypeScript definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

// Network configuration for Base
export const BASE_NETWORK = {
  mainnet: {
    chainId: "0x8453", // 33875 in decimal
    chainName: "Base Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  testnet: {
    chainId: "0x14a33", // 84531 in decimal
    chainName: "Base Sepolia Testnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
}

// Simple ABI for a healthcare payment contract
const PAYMENT_CONTRACT_ABI = [
  "function makePayment(address provider, uint256 amount) payable",
  "function getPaymentHistory(address user) view returns (uint256[])",
  "event PaymentMade(address indexed from, address indexed to, uint256 amount, uint256 timestamp)",
]

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private paymentContract: ethers.Contract | null = null
  private isConnected = false
  private network: "mainnet" | "testnet" = "testnet" // Default to testnet

  constructor(contractAddress?: string, network: "mainnet" | "testnet" = "testnet") {
    this.network = network
  }

  async connect(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Ethereum provider not found. Please install a wallet like MetaMask.")
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      // Switch to Base network
      await this.switchToBaseNetwork()

      this.isConnected = true
      return true
    } catch (error: any) {
      console.error("Failed to connect to wallet:", error)
      this.isConnected = false
      
      // Handle specific error cases
      if (error.code === 4001) {
        throw new Error("Wallet connection was rejected by user.")
      } else if (error.code === -32002) {
        throw new Error("Wallet connection request is already pending. Please check your wallet.")
      } else if (error.message?.includes("User rejected")) {
        throw new Error("Wallet connection was rejected by user.")
      } else {
        throw new Error(`Failed to connect wallet: ${error.message || "Unknown error"}`)
      }
    }
  }

  async switchToBaseNetwork(): Promise<void> {
    if (!window.ethereum || !this.provider) return

    const network = BASE_NETWORK[this.network]
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [network],
          })
        } catch (addError: any) {
          console.error("Failed to add network:", addError)
          throw new Error(`Failed to add ${network.chainName} network. Please add it manually in your wallet.`)
        }
      } else {
        console.error("Failed to switch network:", switchError)
        throw new Error(`Failed to switch to ${network.chainName}. Please switch manually in your wallet.`)
      }
    }
  }

  async initializePaymentContract(contractAddress: string): Promise<void> {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }

    this.paymentContract = new ethers.Contract(contractAddress, PAYMENT_CONTRACT_ABI, this.signer)
  }

  async makePayment(providerAddress: string, amountInEth: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }

    const amountInWei = ethers.parseEther(amountInEth)

    // If we're using a direct transfer without a contract
    return await this.signer.sendTransaction({
      to: providerAddress,
      value: amountInWei,
    })
  }

  async makeContractPayment(providerAddress: string, amountInEth: string): Promise<ethers.TransactionResponse> {
    if (!this.paymentContract || !this.signer) {
      throw new Error("Payment contract not initialized or wallet not connected")
    }

    const amountInWei = ethers.parseEther(amountInEth)

    return await this.paymentContract.makePayment(providerAddress, amountInWei, {
      value: amountInWei,
    })
  }

  async getPaymentHistory(userAddress: string): Promise<string[]> {
    if (!this.paymentContract) {
      throw new Error("Payment contract not initialized")
    }

    const payments = await this.paymentContract.getPaymentHistory(userAddress)
    return payments.map((amount: bigint) => ethers.formatEther(amount))
  }

  async getWalletAddress(): Promise<string> {
    if (!this.signer) {
      // Try to reconnect if not connected
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            this.provider = new ethers.BrowserProvider(window.ethereum)
            this.signer = await this.provider.getSigner()
            this.isConnected = true
            return await this.signer.getAddress()
          }
        } catch (error) {
          console.error("Failed to get existing wallet connection:", error)
        }
      }
      throw new Error("Wallet not connected")
    }
    return await this.signer.getAddress()
  }

  async checkConnection(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ethereum) {
      return false
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        this.provider = new ethers.BrowserProvider(window.ethereum)
        this.signer = await this.provider.getSigner()
        this.isConnected = true
        return true
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error)
    }
    
    this.isConnected = false
    return false
  }

  async getBalance(): Promise<string | null> {
    if (!this.signer || !this.provider) return null

    const address = await this.signer.getAddress()
    const balance = await this.provider.getBalance(address)

    return ethers.formatEther(balance)
  }

  isWalletConnected(): boolean {
    return this.isConnected
  }
}

// Create a singleton instance
let blockchainServiceInstance: BlockchainService | null = null

export function getBlockchainService(
  contractAddress?: string,
  network: "mainnet" | "testnet" = "testnet",
): BlockchainService {
  if (!blockchainServiceInstance) {
    blockchainServiceInstance = new BlockchainService(contractAddress, network)
  }
  return blockchainServiceInstance
}
