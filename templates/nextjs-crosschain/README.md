# Next.js Cross-chain Starter

A minimal Next.js App Router template that connects EVM and Solana wallets in one client session.

## What is included

- Next.js App Router
- wagmi and viem for EVM wallet state
- RainbowKit styles and wallet connector support
- Solana wallet-adapter providers and wallet modal
- A dashboard that shows an EVM address and Solana public key together
- A safe example cross-chain identity view without token transfers or bridging

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and connect either wallet, or connect both wallets to populate the unified session panel.

## Build

```bash
npm run build
npm run start
```

## Template boundary

This starter intentionally does not implement a bridge, token transfer, production authentication, or a backend. It keeps the first cross-chain example to wallet identity pairing so the template is safe to run and easy to extend.
