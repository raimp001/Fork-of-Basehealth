// Mock implementation of AgentKit and MCP
const agentKit = {
  enhanceMessages: (messages: any) => messages,
}

const getWalletContext = async (walletAddress: string) => {
  console.log("Mock getWalletContext called with address:", walletAddress)
  return {
    walletAddress,
    mockContext: true,
  }
}

const getTransactionContext = async (txHash: string) => {
  console.log("Mock getTransactionContext called with txHash:", txHash)
  return {
    txHash,
    mockContext: true,
  }
}

const getHealthcarePaymentContext = async (appointmentId: string, walletAddress: string) => {
  console.log(
    "Mock getHealthcarePaymentContext called with appointmentId:",
    appointmentId,
    "and walletAddress:",
    walletAddress,
  )
  return {
    appointmentId,
    walletAddress,
    mockContext: true,
  }
}

export { agentKit, getWalletContext, getTransactionContext, getHealthcarePaymentContext }
