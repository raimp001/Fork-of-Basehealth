import { ethers } from "ethers"

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
    } catch (error) {
      console.error("Failed to connect to wallet:", error)
      this.isConnected = false
      return false
    }
  }

  async switchToBaseNetwork(): Promise<void> {
    if (!window.ethereum || !this.provider) return

    const networkConfig = this.network === "mainnet" ? BASE_NETWORK.mainnet : BASE_NETWORK.testnet

    try {
      // Try to switch to the Base network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkConfig.chainId }],
      })
    } catch (error: any) {
      // If the error code is 4902, the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkConfig],
        })
      } else {
        throw error
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

  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null
    return await this.signer.getAddress()
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
