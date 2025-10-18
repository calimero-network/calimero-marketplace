# Calimero Marketplace - Development Progress

## Project Overview

Building a multi-stakeholder marketplace application on Calimero with the following roles:
- **Admins** - Manage marketplace creation requests
- **Marketplace Owners** - Manage individual marketplaces and approve sellers
- **Sellers** - Register, add products, fulfill orders
- **Buyers** - Browse products, purchase, confirm delivery

## Architecture

The application uses a **multi-context architecture**:

1. **Context Manager Context** - Runs in "manager" mode
   - Manages all marketplace creation requests
   - Admin approves/denies new marketplace requests
   - Tracks all active marketplaces

2. **Individual Marketplace Contexts** - Each runs in "marketplace" mode
   - Owner manages seller approvals
   - Sellers add/manage products
   - Buyers purchase products
   - Escrow and delivery confirmation

## Completed Tasks ✅

### 1. Project Scaffolding
- ✅ Created project using `create-mero-app`
- ✅ Installed dependencies including `@calimero-network/mero-ui@latest`
- ✅ Updated package names from `kv-store` to `calimero-marketplace`

### 2. Backend Logic (Rust/WASM) - [logic/src/lib.rs](logic/src/lib.rs)

**Data Structures:**
- ✅ `MarketplaceRequest` - Pending marketplace creation requests
- ✅ `MarketplaceInfo` - Approved marketplace details
- ✅ `SellerRequest` - Pending seller registration requests
- ✅ `SellerInfo` - Approved seller details
- ✅ `Product` - Product listings (name, description, quantity, price, images, category, shipping)
- ✅ `Order` - Purchase orders with escrow state and QR payload
- ✅ `EscrowStatus` - Enum: Pending, Released, Refunded
- ✅ `AppMode` - Enum: ContextManager, Marketplace

**Unified State:**
- ✅ `MarketplaceApp` - Single state supporting both modes
  - Mode detection via `AppMode` enum
  - Methods verify mode before execution
  - Efficient storage using `UnorderedMap<String, T>`

**Context Manager Methods:**
- ✅ `init(mode, param1, param2)` - Initialize in manager or marketplace mode
- ✅ `request_marketplace(owner_wallet, store_name, type_of_goods, signature)` - Create marketplace request
- ✅ `admin_approve_marketplace(request_id, context_id)` - Admin approves and creates marketplace
- ✅ `get_all_marketplaces()` - Returns JSON of all marketplaces
- ✅ `get_pending_requests()` - Returns JSON of pending marketplace requests
- ✅ `get_admin_address()` - Returns admin wallet address

**Marketplace Methods:**
- ✅ `request_seller_access(wallet, company_name, company_details, signature)` - Seller registration request
- ✅ `owner_approve_seller(seller_id)` - Owner approves seller
- ✅ `add_product(seller_wallet, name, desc, qty, price, image, category, shipping, signature)` - Seller adds product
- ✅ `purchase_product(product_id, buyer_wallet, amount, signature)` - Buyer purchases (creates escrow)
- ✅ `get_delivery_payload(order_id)` - Get QR payload for delivery confirmation
- ✅ `confirm_delivery(order_id, buyer_signature)` - Release escrow on delivery
- ✅ `get_products()` - Returns JSON of all products
- ✅ `get_sellers()` - Returns JSON of approved sellers
- ✅ `get_pending_seller_requests()` - Returns JSON of pending seller requests
- ✅ `get_orders()` - Returns JSON of all orders
- ✅ `get_order(order_id)` - Returns JSON of specific order
- ✅ `get_owner_wallet()` - Returns marketplace owner wallet
- ✅ `get_marketplace_id()` - Returns marketplace ID

**Features:**
- ✅ Uses `env::time_now()` for timestamps (WASM-compatible)
- ✅ QR payload generation: `https://marketplace.calimero.network/confirm/{order_id}?buyer={wallet}&amount={amount}`
- ✅ Mock USDC escrow (state tracked internally)
- ✅ Ethereum signature placeholders (TODO: implement verification)
- ✅ Events emitted for all major state changes

### 3. Build System
- ✅ Updated [logic/Cargo.toml](logic/Cargo.toml) with correct package name
- ✅ Updated [logic/build.sh](logic/build.sh) to use `calimero_marketplace.wasm`
- ✅ Successfully compiled to WASM
- ✅ Generated ABI at `logic/res/abi.json`

### 4. Frontend Client Generation
- ✅ Generated TypeScript client at [app/src/api/AbiClient.ts](app/src/api/AbiClient.ts)
- ✅ 20 methods available in `AbiClient` class
- ✅ All methods properly typed with params and return types

## Remaining Tasks 📋

### 5. Merobox Workflow Configuration
**File:** [workflows/merobox.yaml](workflows/merobox.yaml)

**TODO:**
- [ ] Update WASM path from `kv_store.wasm` to `calimero_marketplace.wasm`
- [ ] Create ContextManager context:
  - Install WASM with mode="manager"
  - Initialize with admin wallet address
- [ ] Create demo Marketplace context:
  - Install WASM with mode="marketplace"
  - Initialize with marketplace_id and owner_wallet
- [ ] Pre-fill demo data:
  - Marketplace owner creates request
  - Admin approves marketplace
  - Seller requests access
  - Owner approves seller
  - Seller adds 2-3 products
  - Buyer purchases a product
- [ ] Capture context IDs for frontend configuration

**Expected Outputs:**
- Context Manager context ID
- Demo Marketplace context ID
- Sample data populated for testing

### 6. Frontend Implementation
**Files:** [app/src/](app/src/)

**TODO:**

#### A. Update App Configuration
- [ ] Update `app/src/App.tsx`:
  - Set `applicationId` from bootstrap output
  - Initialize separate AbiClient instances for:
    - Context Manager context
    - Demo Marketplace context

#### B. Create Dashboard Components
- [ ] **Admin Dashboard** (`app/src/components/AdminDashboard.tsx`)
  - View pending marketplace requests
  - Approve/deny marketplace requests
  - View all active marketplaces

- [ ] **Marketplace Owner Dashboard** (`app/src/components/OwnerDashboard.tsx`)
  - View pending seller requests
  - Approve/deny sellers
  - View all products in marketplace
  - View all orders/sales

- [ ] **Seller Dashboard** (`app/src/components/SellerDashboard.tsx`)
  - Request seller access (if not approved)
  - Add new products
  - Manage existing products (update quantity)
  - View orders for their products

- [ ] **Buyer Marketplace** (`app/src/components/BuyerMarketplace.tsx`)
  - Browse all products
  - View product details
  - Purchase products (create order)
  - View order history
  - Display QR payload for delivery confirmation

#### C. Shared Components
- [ ] **Wallet Connector** - Mock Base wallet connection UI
- [ ] **Signature Modal** - UI for signing transactions
- [ ] **QR Code Display** - Show delivery confirmation QR
- [ ] **Product Card** - Reusable product display
- [ ] **Order Card** - Reusable order display

#### D. State Management
- [ ] Set up React Context or state management for:
  - Current wallet address
  - Current user role (admin/owner/seller/buyer)
  - Selected marketplace context
  - Cart/checkout flow

#### E. Routing
- [ ] Set up React Router with routes:
  - `/admin` - Admin Dashboard
  - `/owner/:marketplaceId` - Owner Dashboard
  - `/seller/:marketplaceId` - Seller Dashboard
  - `/marketplace/:marketplaceId` - Buyer Marketplace
  - `/orders` - Order history

### 7. Network Bootstrap
**Commands:**
```bash
cd calimero-marketplace
pnpm network:bootstrap
```

**TODO:**
- [ ] Run bootstrap workflow
- [ ] Capture Context Manager `applicationId`
- [ ] Capture Demo Marketplace `contextId`
- [ ] Update `app/src/App.tsx` with captured IDs
- [ ] Verify contexts are created correctly

### 8. Testing & Validation

**TODO:**
- [ ] Run frontend dev server: `pnpm app:dev`
- [ ] Test complete happy path:
  1. Admin views pending marketplace requests
  2. Admin approves marketplace request
  3. Seller requests access to marketplace
  4. Owner approves seller
  5. Seller adds product
  6. Buyer browses products
  7. Buyer purchases product (verify escrow state = Pending)
  8. Buyer receives QR payload
  9. Buyer confirms delivery (verify escrow state = Released)
  10. Verify order delivered_at timestamp is set

**Integration Tests:**
- [ ] Test error states (insufficient quantity, wrong mode, etc.)
- [ ] Test wallet signature flows
- [ ] Test JSON parsing from view methods
- [ ] Test multi-marketplace scenarios

## Technical Notes

### Key Design Decisions

1. **Unified State Model**: Single `MarketplaceApp` struct with mode flag instead of separate structs
   - Pros: Single WASM binary, simpler deployment
   - Cons: Slightly larger memory footprint per context

2. **String-based Storage Keys**: Using `UnorderedMap<String, T>` throughout
   - Required by Calimero storage (needs `AsRef<[u8]>`)
   - Auto-incrementing counters for ID generation

3. **JSON Return Types**: View methods return JSON strings
   - Complex types serialized on backend
   - Parsed on frontend
   - Avoids ABI complexity with nested structures

4. **Mock Signatures**: Signature parameters present but not verified
   - Placeholders for future Ethereum `ecrecover` implementation
   - Allows testing workflow without crypto complexity

5. **Expect vs Result**: Using `.expect()` for simplicity in demo
   - Production should use proper error handling with `app::bail!`
   - Avoids complexity with Calimero's error types

### Known Limitations & TODOs

- [ ] **Ethereum Signature Verification**: Implement `ecrecover` for Base wallet signatures
- [ ] **Caller Verification**: Add proper authorization checks (admin-only, owner-only methods)
- [ ] **USDC Integration**: Replace mock escrow with actual USDC contract calls
- [ ] **QR Signature**: Implement signed JWT or similar for QR payloads
- [ ] **Product Updates**: Add methods to update product quantity, price, etc.
- [ ] **Order Refunds**: Implement refund flow (EscrowStatus::Refunded)
- [ ] **Seller Denial**: Add method to deny seller requests
- [ ] **Marketplace Listing**: Add marketplace discovery/browsing
- [ ] **Search & Filters**: Add product search and category filtering
- [ ] **Images**: Implement proper image upload/storage (IPFS?)
- [ ] **Pagination**: Add pagination for large product/order lists

## File Structure

```
calimero-marketplace/
├── logic/
│   ├── src/
│   │   └── lib.rs              # Main Rust logic (670 lines)
│   ├── Cargo.toml              # Updated package name
│   ├── build.sh                # Updated WASM filename
│   └── res/
│       ├── abi.json            # Generated ABI
│       └── calimero_marketplace.wasm  # Compiled WASM
├── app/
│   ├── src/
│   │   ├── api/
│   │   │   └── AbiClient.ts    # Generated TypeScript client
│   │   ├── App.tsx             # Main app (needs applicationId update)
│   │   └── components/         # TODO: Create dashboard components
│   └── package.json
├── workflows/
│   └── merobox.yaml            # TODO: Update workflow
├── package.json
├── pnpm-lock.yaml
└── PROGRESS.md                 # This file
```

## Commands Reference

```bash
# Build backend
pnpm logic:build

# Generate frontend client
pnpm app:generate-client

# Bootstrap network (run Merobox workflow)
pnpm network:bootstrap

# Run frontend dev server
pnpm app:dev

# Run both in watch mode
pnpm dev
```

## Next Steps

1. **Configure Merobox Workflow** - Update `workflows/merobox.yaml` with proper initialization
2. **Bootstrap Network** - Run workflow to create contexts and populate demo data
3. **Build Frontend** - Implement dashboard components using generated `AbiClient`
4. **End-to-End Test** - Validate complete happy path workflow

---

**Last Updated:** 2025-10-18
**Status:** Backend Complete, Frontend Pending
**Estimated Completion:** ~4-6 hours for frontend + workflow configuration

**Note:** Directory structure has been flattened - all project files are now in the root directory (no nested `calimero-marketplace/calimero-marketplace`).
