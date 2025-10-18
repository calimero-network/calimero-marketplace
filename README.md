# Calimero Marketplace

A decentralized multi-stakeholder marketplace application built on Calimero Network with multi-context architecture.

## Overview

This marketplace application supports the following stakeholders:
- **Admins** - Manage marketplace creation requests via Context Manager
- **Marketplace Owners** - Approve sellers and manage individual marketplaces
- **Sellers** - Register, add products, and fulfill orders
- **Buyers** - Browse products, purchase items, and confirm delivery

## Status

✅ **Fully Functional** - Backend (22 Rust methods), frontend (5 dashboards), and bootstrap workflow all working
- Backend: Complete Rust/WASM contract with escrow logic
- Frontend: 5 React dashboards with full CRUD operations
- Bootstrap: 46-step automated workflow with demo data
- See [PROGRESS.md](PROGRESS.md) for detailed development notes

## Architecture

The application uses a **multi-context architecture**:

1. **Context Manager Context** - Runs in "manager" mode
   - Manages marketplace creation requests
   - Admin approval workflow
   - Tracks all active marketplaces

2. **Individual Marketplace Contexts** - Each runs in "marketplace" mode
   - Owner manages seller approvals
   - Product listings and inventory
   - Purchase orders with mock USDC escrow
   - QR-based delivery confirmation

## Project Structure

```
calimero-marketplace/
├── logic/              # Rust smart contract (compiled to WASM)
│   ├── src/lib.rs      # Main application logic
│   ├── res/            # Build artifacts (WASM + ABI)
│   └── Cargo.toml
├── app/                # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/        # Generated ABI client
│   │   ├── App.tsx     # Main application
│   │   └── components/ # UI components (TODO)
│   └── package.json
├── workflows/          # Merobox workflow configuration
├── scripts/            # Build and sync scripts
├── PROGRESS.md         # Detailed development progress
└── package.json        # Root package configuration
```

## Prerequisites

- **pnpm** (or npm) for JavaScript tooling
- **Rust toolchain** + wasm target: `rustup target add wasm32-unknown-unknown`
- **Optional**: `wasm-opt` for size optimization

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Backend (Rust → WASM)

```bash
pnpm logic:build
```

This compiles the Rust contract to WASM and generates the ABI at `logic/res/abi.json`.

### 3. Generate Frontend Client

```bash
pnpm app:generate-client
```

Generates TypeScript client from ABI into `app/src/api/AbiClient.ts`.

### 4. Bootstrap Local Network

```bash
pnpm network:bootstrap
```

**Why do we need this?**
The bootstrap workflow sets up your complete local development environment in one command. Instead of manually creating contexts and adding test data through the UI, this automated workflow gives you a fully working marketplace with demo data, ready to test immediately. Every time you rebuild the WASM (after changing Rust code), you'll re-run this to restart the nodes with your latest changes.

**What it does:**
- Starts 2 Calimero nodes (node-1 and node-2)
- Installs the marketplace application
- Creates Context Manager and Demo Marketplace contexts
- Populates with demo data (admin, sellers, products, orders)

**⚠️ IMPORTANT: Update Context IDs after bootstrap**

The bootstrap creates new contexts with unique IDs each time. You need to update these IDs in the frontend code:

1. **Look for the IDs in bootstrap output:**
   ```
   manager_context_id: <CONTEXT_ID_1>
   marketplace_context_id: <CONTEXT_ID_2>
   ```

2. **Update these 4 files:**
   - `app/src/pages/marketplace/AdminDashboard.tsx` - Replace `CONTEXT_MANAGER_ID`
   - `app/src/pages/marketplace/OwnerDashboard.tsx` - Replace `MARKETPLACE_CONTEXT_ID`
   - `app/src/pages/marketplace/SellerDashboard.tsx` - Replace `MARKETPLACE_CONTEXT_ID`
   - `app/src/pages/marketplace/BuyerMarketplace.tsx` - Replace `MARKETPLACE_CONTEXT_ID`

3. **Demo Data Created:**
   - Admin: `0xAdminWallet123456789`
   - Owner: `0xOwnerWalletABC` (TechGadgets Store)
   - Approved Seller: `0xSellerWallet001` (TechSupplies Inc) with 3 products
   - Pending Seller: `0xSellerWallet002` (SmartHome Solutions)
   - Buyer: `0xBuyerWallet001` with 1 order

### 5. Run Frontend

```bash
pnpm app:dev
```

Opens the React app in your browser.

## Development Workflow

### Watch Mode (Recommended)

Run the frontend with automatic reload and WASM sync:

```bash
pnpm dev
```

This runs:
- Vite dev server for the frontend
- File watcher on `logic/res/` that:
  - Regenerates client when `abi.json` changes
  - Syncs WASM to local nodes when `*.wasm` changes

### Manual Build Steps

1. **Edit Rust contract** in `logic/src/lib.rs`
2. **Build WASM**: `pnpm logic:build`
3. **Regenerate client** (if ABI changed): `pnpm app:generate-client`
4. **Sync WASM** to nodes: `pnpm logic:sync`

## Backend Contract Capabilities

### Context Manager Methods (mode="manager")

- `init(mode, admin_address, _)` - Initialize Context Manager
- `request_marketplace(owner_wallet, store_name, type_of_goods, signature)` - Request new marketplace
- `admin_approve_marketplace(request_id, context_id)` - Approve marketplace request
- `get_all_marketplaces()` - Get all approved marketplaces (JSON)
- `get_pending_requests()` - Get pending marketplace requests (JSON)
- `get_admin_address()` - Get configured admin wallet

### Marketplace Methods (mode="marketplace")

- `init(mode, marketplace_id, owner_wallet)` - Initialize marketplace
- `request_seller_access(wallet, company_name, company_details, signature)` - Seller registration
- `owner_approve_seller(seller_id)` - Approve seller
- `add_product(seller_wallet, name, description, qty, price, image_url, category, shipping, signature)` - Add product
- `purchase_product(product_id, buyer_wallet, amount, signature)` - Purchase product
- `get_delivery_payload(order_id)` - Get QR payload for delivery
- `confirm_delivery(order_id, buyer_signature)` - Confirm delivery and release escrow
- `get_products()` - Get all products (JSON)
- `get_sellers()` - Get approved sellers (JSON)
- `get_pending_seller_requests()` - Get pending seller requests (JSON)
- `get_orders()` - Get all orders (JSON)
- `get_order(order_id)` - Get specific order (JSON)

### Events

- `MarketplaceRequested` - Marketplace creation requested
- `MarketplaceApproved` - Marketplace approved by admin
- `SellerRequested` - Seller access requested
- `SellerApproved` - Seller approved by owner
- `ProductAdded` - Product added to marketplace
- `OrderCreated` - Purchase order created
- `DeliveryConfirmed` - Delivery confirmed, escrow released

## Key Features

✅ **Multi-context architecture** - Separate contexts for manager and marketplaces
✅ **Mock USDC escrow** - State-based escrow simulation
✅ **QR delivery confirmation** - Payload generation for delivery verification
✅ **Ethereum signature support** - Placeholders for Base wallet signatures
✅ **Type-safe frontend client** - Auto-generated from ABI
✅ **Event emissions** - Track all state changes
✅ **Timestamps** - Using `env::time_now()` for WASM compatibility

## Development Status

**✅ Completed:**
- Backend logic (Rust/WASM) - 670 lines
- WASM build system
- ABI client generation
- Project structure and tooling

**📋 TODO:**
- Merobox workflow configuration with demo data
- Frontend UI components (Admin, Owner, Seller, Buyer dashboards)
- Ethereum signature verification implementation
- End-to-end testing

See [PROGRESS.md](./PROGRESS.md) for detailed development progress and task breakdown.

## Available Scripts

### Root Package Scripts

- `pnpm logic:build` - Build Rust contract to WASM
- `pnpm logic:clean` - Clean Rust build artifacts
- `pnpm logic:watch` - Watch for changes in `logic/res/`
- `pnpm logic:sync` - Sync WASM to local nodes
- `pnpm app:dev` - Run frontend dev server + watchers
- `pnpm app:generate-client` - Generate TypeScript client from ABI
- `pnpm network:bootstrap` - Bootstrap local Calimero network
- `pnpm dev` - Run full dev environment (frontend + watchers)

### App Package Scripts

- `pnpm --dir app dev` - Vite dev server only
- `pnpm --dir app build` - Build production frontend
- `pnpm --dir app preview` - Preview production build

## Troubleshooting

### Missing Dependencies

If `concurrently` or `chokidar-cli` are missing:

```bash
pnpm install
```

### ABI Codegen Fails

Ensure you're using the correct version:

```bash
npx @calimero-network/abi-codegen@0.1.1 -i logic/res/abi.json -o app/src/api
```

### WASM Build Fails

1. Check Rust toolchain: `rustc --version`
2. Add WASM target: `rustup target add wasm32-unknown-unknown`
3. Clean and rebuild: `pnpm logic:clean && pnpm logic:build`

### Context Not Found

After running `pnpm network:bootstrap`, make sure to:
1. Copy the `applicationId` from the output
2. Update `app/src/App.tsx` with the captured ID

## Documentation

- **Detailed Progress**: [PROGRESS.md](./PROGRESS.md)
- **Original Spec**: [app-prompt.md](./app-prompt.md)
- **Calimero Docs**: https://calimero-network.github.io/build/quickstart

## License

See [LICENSE](./LICENSE)

---

**Built with Calimero Network** - Decentralized private shards for Web3 applications
