// Network configuration for Base
export const NETWORK_ID = process.env.NETWORK_ID || "base-sepolia"

export const NETWORK_CONFIG = {
  "base-mainnet": {
    chainId: "0x2105", // 8453 in decimal (Base Mainnet correct chain ID)
    chainName: "Base Mainnet",
    currencySymbol: "ETH",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
  },
  "base-sepolia": {
    chainId: "0x14A34", // 84532 in decimal (Base Sepolia correct chain ID)
    chainName: "Base Sepolia Testnet",
    currencySymbol: "ETH",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
  },
}

// Supported tokens for each network
export const SUPPORTED_TOKENS = {
  "base-mainnet": [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "native", // Native token
      decimals: 18,
      logoUrl: "/images/tokens/eth.svg",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      logoUrl: "/images/tokens/usdc.svg",
    },
  ],
  "base-sepolia": [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "native", // Native token
      decimals: 18,
      logoUrl: "/images/tokens/eth.svg",
    },
    {
      symbol: "tUSDC",
      name: "Test USD Coin",
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      decimals: 6,
      logoUrl: "/images/tokens/usdc.svg",
    },
  ],
}
