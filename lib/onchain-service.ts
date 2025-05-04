import { NETWORK_CONFIG, NETWORK_ID } from "./constants"

// This service will be used to interact with the OnchainKit
export class OnchainService {
  // Get current network configuration
  getNetworkConfig() {
    return NETWORK_CONFIG[NETWORK_ID as keyof typeof NETWORK_CONFIG] || NETWORK_CONFIG["base-sepolia"]
  }

  // Check if we're in a browser environment
  isBrowser() {
    return typeof window !== "undefined"
  }
}

// Create singleton instance
export const onchainService = new OnchainService()
