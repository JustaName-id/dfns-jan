# JustAName Wallet System with DFNS Integration

A Next.js-based wallet management system that leverages DFNS WaaS (Wallet-as-a-Service) for secure and scalable wallet operations and JustaName as an identity system. This project implements a complete wallet system with user registration, authentication, and Web3 capabilities.

## Features

- Next.js 14+ with App Router and TypeScript
- Complete wallet management system:
  - User registration and authentication
  - Wallet creation and management
  - Multi-chain support through DFNS
  - WebAuthn (Passkey) integration for secure signing
- DFNS WaaS Integration:
  - Custodial wallet support
  - Multi-chain compatibility (40+ networks including Ethereum, Bitcoin, Solana, etc.)
  - Secure transaction signing
- Wagmi connector for Web3 interactions
- Tailwind CSS for styling
- Environment-based configuration
- API routes for wallet operations

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.17 or later
- DFNS account and credentials
- Environment variables configured (see Configuration section)
- Domain with SSL for WebAuthn support

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables in `.env`:

```env
# DFNS
DFNS_API_URL=
DFNS_APP_ID=
DFNS_CRED_ID=
DFNS_PRIVATE_KEY=
DFNS_AUTH_TOKEN=
NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_ID=
NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_NAME=
# JustaName
NODE_ENV=
NEXT_PUBLIC_ORIGIN=
NEXT_PUBLIC_DOMAIN=
NEXT_PUBLIC_MAINNET_PROVIDER_URL=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_DEV=
DEV=
MAINNET_PROVIDER_URL=
SESSION_SECRET=
```

1. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── clients.ts
│   │   └── wallets/
│   ├── page.tsx      # Main wallet interface
│   └── providers.tsx  # App providers
├── components/
│   └── sections/
│       ├── login.tsx
│       ├── register.tsx
│       └── wallets.tsx
├── connectors/
│   └── DFNSConnector.ts  # Custom Wagmi connector for DFNS
└── hooks/
    ├── useAuth
    ├── useLogin
    ├── useRegister
    ├── useToast
    └── useWallets
```

## Core Components

### DFNSConnector

Custom Wagmi connector that enables:

- Wallet connection management
- Transaction signing via DFNS
- Support for multiple blockchain networks
- WebAuthn integration for secure signing

### Wallet Interface

The main application provides:

- User registration interface
- Login functionality
- Wallet management dashboard

## Configuration

This project requires proper configuration of DFNS credentials and WebAuthn settings:

1. DFNS Configuration:

   - API URL
   - App ID and credentials
   - Credential ID
   - Private key for secure operations
   - Auth token for secure operations

2. WebAuthn Configuration:
   - Relying Party ID (domain name)
   - Relying Party Name (application name)

## Development

The project uses TypeScript and follows modern development practices. Make sure to:

- Follow the existing code style
- Update documentation when making changes
- Test WebAuthn functionality on HTTPS or localhost
