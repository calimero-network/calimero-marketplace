# 🧠 Calimero AI Prompt Template (for Cursor / AI builders)

This markdown file is meant to be used as a **prompt template** for AI tools like **Cursor**, **GitHub Copilot**, or other LLM-based assistants that can scaffold Calimero applications.

It includes:
- The full build & workflow guide for Calimero apps  
- Commentary on how to use it as an AI prompt  
- A sample application spec at the end (Battleships game)

> 💡 Copy this entire markdown into your AI environment (Cursor, Copilot, etc.)  
> Then replace the app specification section at the end with your own app idea.

---

## 🧾 Original Prompt

Let’s build a Calimero application together:

First step for you is to call install:

```bash
npm i -g create-mero-app@latest
npx create-mero-app <application_name>
```

with your `<application_name>`.

You can familiarize yourself with how to build by reading the README,  
but here is a simple overview of how things work.

---

## 🗂️ Project Structure (generated)

- `app/`: Frontend (Vite + React)
- `logic/`: Calimero service logic (Rust → WASM)
- `package.json`: Top-level scripts for both logic and app

**Key top-level scripts:**
- `pnpm logic:build`: builds WASM + ABI  
- `pnpm app:generate-client`: generates typed client from ABI  
- `pnpm app:dev`: runs frontend dev server  

> 💡 When you run `pnpm logic:build`, the app automatically generates the client.  
> If you change the logic `package_name`, update the `applicationId` after running the Merobox workflow.

---

## ⚙️ Backend Logic Guidelines (Rust)

- Use `UnorderedMap<String, T>` for keys. Avoid `u64` keys (storage requires `AsRef<[u8]>`).  
- For timestamps in WASM, use the Calimero env helper (not `std::time::SystemTime`):

  ```rust
  env::time_now() // returns block time in ms
  ```

  [Source: core/env.rs#L114](https://github.com/calimero-network/core/blob/5880b882fc948cafdd8be7ecb69613047086946e/crates/storage/src/env.rs#L114)

- If you return complex types to the frontend:
  - Make them `Serialize` and return directly if ABI supports them, or
  - Serialize to JSON String in view functions.
- Avoid exposing helper methods with conflicting names (e.g., multiple `from_string`, `to_string`). Prefer private helpers.

---

## 🔨 Build Flow (Authoritative)

1. Edit Rust logic in `logic/src/lib.rs`.
2. Build WASM + ABI:
   ```bash
   pnpm logic:build
   ```
3. Generate frontend ABI client (if ABI changed):
   ```bash
   pnpm app:generate-client
   ```
4. Run frontend:
   ```bash
   pnpm app:dev
   ```

---

## 🧩 Merobox Workflow (install, context, prefill)

Update workflow to install the built WASM and create a context:

- Change path to `logic/res/<your_app>.wasm`
- Add steps to call your logic methods to prefill demo data (e.g. create issues, add comments)

Run:
```bash
merobox bootstrap run workflow-example.yml
```

Grab the captured `applicationId` and update:

```ts
// app/src/App.tsx
const [clientAppId] = useState<string>('REPLACE_WITH_applicationId');
```

---

## 💻 Frontend Integration Notes

After generating `app/src/api/AbiClient.ts`, use it via an app-aware factory:

```ts
const contexts = await app.fetchContexts();
const context = contexts[0];
const api = new AbiClient(app, context);
```

If ABI return types are JSON strings, parse on the client:

```ts
const issuesJson = await api.getAllIssues();
const issues = JSON.parse(issuesJson);
```

If any named exports are missing (e.g., Modal/Badge), temporarily shim them with simple styled elements, then re-upgrade `@calimero-network/mero-ui` and clear Vite cache.

---

## 🧯 Common Pitfalls + Fixes

**Missing export errors:**
```bash
pnpm --dir app update @calimero-network/mero-ui --latest
rm -rf app/node_modules/.vite
pnpm --dir app dev
```

Optionally log exports:
```ts
import * as UI from '@calimero-network/mero-ui';
console.log(Object.keys(UI));
```

Other common fixes:
- ABI codegen “Duplicate method names” → make helpers private or rename  
- `UnorderedMap` iteration → use `.entries()?`  
- WASM time panic → use `env::time_now()`  
- Key types → use `String` keys, convert IDs with `.to_string()`

---

## ⚙️ Quality-of-Life Scripts

Add to top-level `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -k -n logic,app \"pnpm logic:build --watch\" \"pnpm app:dev\"",
    "rebuild": "pnpm logic:build && pnpm app:generate-client",
    "bootstrap": "pnpm network:bootstrap"
  }
}
```

---

## 🚀 End-to-End Quickstart

```bash
# Scaffold
npm i -g create-mero-app@latest
npx create-mero-app shared-todo-backlog
cd shared-todo-backlog

# Dependencies
pnpm install
pnpm add @calimero-network/mero-ui@latest

# Build backend + client
pnpm logic:build
pnpm app:generate-client

# Set applicationId in app/src/App.tsx from bootstrap output
# Then run the frontend
pnpm app:dev
```

---

## 🔗 References

- Calimero env time helper: `env::time_now()`  
  [core/env.rs#L114](https://github.com/calimero-network/core/blob/5880b882fc948cafdd8be7ecb69613047086946e/crates/storage/src/env.rs#L114)

---

## ⚔️ Example Application Specification

Let's build a marketplace app as a Calimero application.

These are the stakeholders in the marketplace app:

- Admins
- Sellers
- Buyers

I'll now give you the first happy path scenario that you'll build around.

- Admin and marketplace owner spins up a new Calimero Marketplace for a certain type of a good (eg. electronics)

- Marketplace has a store page that shows the list of items that are being sold

- First Seller comes in and requests to start selling; submits the following data - company details (no kyc for now) and product details (name, quantity, prices) - sings with a wallet (TODO, leave it as a stub at first)

- Admin verifies the signature and approves; sellers product is then shown on the store page; store page is reachable for everyone

- A Buyer wants to purchase the product in USDC - tokens (USDC) submitted into the escrow - QR code is generated with a short link containing a payload the the buyer will sign

- Goods arrive to the user, users app scans the QR code which triggers escrow release

---

🧩 **Template designed for AI-assisted Calimero app generation.**
