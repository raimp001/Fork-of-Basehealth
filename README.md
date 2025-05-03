# BaseHealth V55

BaseHealth is a decentralized healthcare platform that connects patients with healthcare providers, facilitates telemedicine appointments, and enables secure cryptocurrency payments on the Base network.

## Features

- **Personalized Health Screening**: Get recommendations based on your age, gender, and risk factors
- **Provider Search**: Find qualified healthcare providers by specialty and location
- **Telemedicine**: Virtual consultations with healthcare providers
- **Electronic Prescriptions**: Receive prescriptions digitally
- **Lab Orders & Referrals**: Get lab tests and specialist referrals
- **Crypto Payments**: Pay for healthcare services using cryptocurrency on Base
- **Provider Verification**: Verified providers to ensure quality care
- **AI Health Assistant**: Get personalized health guidance from our AI

## Technology Stack

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Coinbase API for crypto payments
- Base network for blockchain transactions
- OpenAI for AI features
- Supabase for database and authentication

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
COINBASE_CDP_API_KEY=your_coinbase_api_key
COINBASE_CDP_API_SECRET=your_coinbase_api_secret
OPENAI_API_KEY=your_openai_api_key
NETWORK_ID=base-sepolia
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Note: Additional environment variables for production should be configured directly in your deployment platform's environment settings.

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
