import { ethers } from "ethers"
import * as fs from "fs"
import * as path from "path"

async function main() {
  // Connect to the network
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://sepolia.base.org")
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider)

  console.log("Deploying InsuranceClaims contract...")

  // Read the contract bytecode and ABI
  const contractPath = path.join(__dirname, "../artifacts/contracts/InsuranceClaims.sol/InsuranceClaims.json")
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"))
  const contractBytecode = contractJson.bytecode
  const contractAbi = contractJson.abi

  // Create contract factory
  const InsuranceClaims = new ethers.ContractFactory(contractAbi, contractBytecode, wallet)

  // Deploy the contract
  const insuranceClaims = await InsuranceClaims.deploy()
  await insuranceClaims.waitForDeployment()

  const address = await insuranceClaims.getAddress()
  console.log(`InsuranceClaims deployed to: ${address}`)

  // Save the deployment info
  const deploymentInfo = {
    address,
    network: process.env.NETWORK || "base-sepolia",
    timestamp: new Date().toISOString(),
  }

  fs.writeFileSync(
    path.join(__dirname, "../deployments/insurance-claims.json"),
    JSON.stringify(deploymentInfo, null, 2)
  )

  console.log("Deployment info saved to deployments/insurance-claims.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 