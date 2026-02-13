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

// Insurance Claims Contract ABI
const INSURANCE_CONTRACT_ABI = [
  "function submitClaim(string calldata claimId, uint256 amount, string calldata description) returns (bool)",
  "function getClaimStatus(string calldata claimId) view returns (uint8)",
  "function approveClaim(string calldata claimId) returns (bool)",
  "function rejectClaim(string calldata claimId, string calldata reason) returns (bool)",
  "function getClaimsByPatient(address patient) view returns (string[])",
  "function getClaimsByProvider(address provider) view returns (string[])",
  "function getClaimDetails(string calldata claimId) view returns (uint256 amount, uint8 status, uint256 timestamp)",
  "event ClaimSubmitted(address indexed patient, string claimId, uint256 amount)",
  "event ClaimStatusChanged(string claimId, uint8 status, string reason)"
]

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private paymentContract: ethers.Contract | null = null
  private insuranceContract: ethers.Contract | null = null
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

  async initializeInsuranceContract(contractAddress: string): Promise<void> {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }

    this.insuranceContract = new ethers.Contract(contractAddress, INSURANCE_CONTRACT_ABI, this.signer)
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

  async submitInsuranceClaim(claimId: string, amount: string, description: string): Promise<ethers.TransactionResponse> {
    if (!this.insuranceContract || !this.signer) {
      throw new Error("Insurance contract not initialized or wallet not connected")
    }

    const amountInWei = ethers.parseEther(amount)
    return await this.insuranceContract.submitClaim(claimId, amountInWei, description)
  }

  async getClaimStatus(claimId: string): Promise<number> {
    if (!this.insuranceContract) {
      throw new Error("Insurance contract not initialized")
    }

    return await this.insuranceContract.getClaimStatus(claimId)
  }

  async getPatientClaims(patientAddress: string): Promise<string[]> {
    if (!this.insuranceContract) {
      throw new Error("Insurance contract not initialized")
    }

    return await this.insuranceContract.getClaimsByPatient(patientAddress)
  }

  async getProviderClaims(providerAddress: string): Promise<Array<{
    claimId: string
    amount: bigint
    status: number
    timestamp: bigint
  }>> {
    if (!this.insuranceContract) {
      throw new Error("Insurance contract not initialized")
    }

    const claimIds = await this.insuranceContract.getClaimsByProvider(providerAddress)
    
    const claims = await Promise.all(
      claimIds.map(async (claimId: string) => {
        if (!this.insuranceContract) {
          throw new Error("Insurance contract not initialized")
        }
        const details = await this.insuranceContract.getClaimDetails(claimId)
        return {
          claimId,
          amount: details.amount,
          status: details.status,
          timestamp: details.timestamp,
        }
      })
    )

    return claims
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
