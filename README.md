# BaseHealth

BaseHealth is a decentralized healthcare platform that connects patients with healthcare providers, facilitates telemedicine appointments, and enables secure cryptocurrency payments on the Base network.

## Features

- **Personalized Health Screening**: Get recommendations based on your age, gender, and risk factors
- **Provider Search**: Find qualified healthcare providers by specialty and location
- **Telemedicine**: Virtual consultations with healthcare providers
- **Electronic Prescriptions**: Receive prescriptions digitally
- **Lab Orders & Referrals**: Get lab tests and specialist referrals
- **Crypto Payments**: Pay for healthcare services using cryptocurrency
- **Provider Verification**: Verified providers to ensure quality care
- **Admin Portal**: For provider credential review and approval

## Technology Stack

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Coinbase AgentKit for crypto payments
- Base network for blockchain transactions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The following environment variables are required:

- `COINBASE_CDP_API_KEY`: Coinbase API key
- `COINBASE_CDP_API_SECRET`: Coinbase API secret
- `NETWORK_ID`: Base network ID
- `MCP_API_KEY`: Medical Credentialing Platform API key

Note: All API keys should be kept secure and never exposed in client-side code.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
