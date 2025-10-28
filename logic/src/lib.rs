#![allow(clippy::len_without_is_empty)]

use std::collections::BTreeMap;

// Include the generated ABI code
include!(env!("GENERATED_ABI_PATH"));

use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::serde::{Deserialize, Serialize};
use calimero_storage::collections::UnorderedMap;
use calimero_storage::env;
use thiserror::Error;

// ============================================================================
// Data Structures
// ============================================================================

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct MarketplaceRequest {
    pub id: String,
    pub owner_wallet: String,
    pub store_name: String,
    pub type_of_goods: String,
    pub signature: String,
    pub timestamp: u64,
    pub approved: bool,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct MarketplaceInfo {
    pub id: String,
    pub owner_wallet: String,
    pub store_name: String,
    pub type_of_goods: String,
    pub context_id: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct SellerRequest {
    pub id: String,
    pub wallet_address: String,
    pub company_name: String,
    pub company_details: String,
    pub signature: String,
    pub timestamp: u64,
    pub approved: bool,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct SellerInfo {
    pub id: String,
    pub wallet_address: String,
    pub company_name: String,
    pub company_details: String,
    pub approved_at: u64,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Product {
    pub id: String,
    pub seller_id: String,
    pub name: String,
    pub description: String,
    pub quantity: u32,
    pub price: String, // USDC amount as string
    pub image_url: String,
    pub category: String,
    pub shipping_info: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub enum EscrowStatus {
    Pending,
    Released,
    Refunded,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Order {
    pub id: String,
    pub buyer_wallet: String,
    pub product_id: String,
    pub seller_id: String,
    pub amount: String, // USDC amount as string (mocked)
    pub escrow_status: EscrowStatus,
    pub qr_payload: String,
    pub created_at: u64,
    pub delivered_at: Option<u64>,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialEq)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub enum AppMode {
    ContextManager,
    Marketplace,
}

// ============================================================================
// Unified Marketplace App State
// ============================================================================

#[app::state(emits = for<'a> MarketplaceAppEvent<'a>)]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct MarketplaceApp {
    // Mode: ContextManager or Marketplace
    mode: AppMode,

    // ContextManager fields
    admin_address: Option<String>,
    marketplace_requests: UnorderedMap<String, MarketplaceRequest>,
    marketplaces: UnorderedMap<String, MarketplaceInfo>,
    request_counter: u64,
    marketplace_counter: u64,

    // Marketplace fields
    marketplace_id: Option<String>,
    owner_wallet: Option<String>,
    seller_requests: UnorderedMap<String, SellerRequest>,
    sellers: UnorderedMap<String, SellerInfo>,
    products: UnorderedMap<String, Product>,
    orders: UnorderedMap<String, Order>,
    seller_counter: u64,
    product_counter: u64,
    order_counter: u64,
}

#[app::event]
pub enum MarketplaceAppEvent<'a> {
    // ContextManager events
    MarketplaceRequested { request_id: &'a str, owner_wallet: &'a str },
    MarketplaceApproved { marketplace_id: &'a str, owner_wallet: &'a str },

    // Marketplace events
    SellerRequested { seller_id: &'a str, wallet: &'a str },
    SellerApproved { seller_id: &'a str },
    ProductAdded { product_id: &'a str, seller_id: &'a str },
    OrderCreated { order_id: &'a str, buyer_wallet: &'a str },
    DeliveryConfirmed { order_id: &'a str },
}

#[derive(Debug, Error, Serialize)]
#[serde(crate = "calimero_sdk::serde")]
#[serde(tag = "kind", content = "data")]
pub enum MarketplaceAppError<'a> {
    #[error("unauthorized: only admin can perform this action")]
    Unauthorized,
    #[error("wrong mode: expected {expected}, got {actual}")]
    WrongMode { expected: &'a str, actual: &'a str },
    #[error("marketplace request not found: {0}")]
    RequestNotFound(&'a str),
    #[error("marketplace not found: {0}")]
    MarketplaceNotFound(&'a str),
    #[error("seller not found: {0}")]
    SellerNotFound(&'a str),
    #[error("product not found: {0}")]
    ProductNotFound(&'a str),
    #[error("order not found: {0}")]
    OrderNotFound(&'a str),
    #[error("insufficient quantity")]
    InsufficientQuantity,
    #[error("invalid signature")]
    InvalidSignature,
}

#[app::logic]
impl MarketplaceApp {
    // ========================================================================
    // Initialization methods
    // ========================================================================

    #[app::init]
    pub fn init() -> MarketplaceApp {
        app::log!("Creating uninitialized MarketplaceApp - must call init_manager or init_marketplace");
        MarketplaceApp {
            mode: AppMode::ContextManager, // default mode, will be set properly during init
            admin_address: None,
            marketplace_requests: UnorderedMap::new(),
            marketplaces: UnorderedMap::new(),
            request_counter: 0,
            marketplace_counter: 0,
            marketplace_id: None,
            owner_wallet: None,
            seller_requests: UnorderedMap::new(),
            sellers: UnorderedMap::new(),
            products: UnorderedMap::new(),
            orders: UnorderedMap::new(),
            seller_counter: 0,
            product_counter: 0,
            order_counter: 0,
        }
    }

    /// Initialize as Context Manager
    pub fn init_manager(&mut self, admin_address: String) -> app::Result<String> {
        app::log!("Initializing ContextManager with admin: {}", admin_address);
        self.mode = AppMode::ContextManager;
        self.admin_address = Some(admin_address.clone());
        Ok(format!("Initialized as ContextManager with admin: {}", admin_address))
    }

    /// Initialize as Marketplace
    pub fn init_marketplace(&mut self, marketplace_id: String, owner_wallet: String) -> app::Result<String> {
        app::log!("Initializing Marketplace {} for owner {}", marketplace_id, owner_wallet);
        self.mode = AppMode::Marketplace;
        self.marketplace_id = Some(marketplace_id.clone());
        self.owner_wallet = Some(owner_wallet.clone());
        Ok(format!("Initialized as Marketplace {} for owner {}", marketplace_id, owner_wallet))
    }

    pub fn get_mode(&self) -> app::Result<String> {
        let mode_str = match self.mode {
            AppMode::ContextManager => "ContextManager",
            AppMode::Marketplace => "Marketplace",
        };
        Ok(mode_str.to_string())
    }

    // ========================================================================
    // ContextManager methods
    // ========================================================================

    pub fn request_marketplace(
        &mut self,
        owner_wallet: String,
        store_name: String,
        type_of_goods: String,
        signature: String,
    ) -> app::Result<String> {
        if self.mode != AppMode::ContextManager {
            app::bail!("This method is only available in ContextManager mode");
        }

        app::log!("Marketplace request from: {}", owner_wallet);

        // TODO: Verify Ethereum signature
        // For now, we'll accept the signature as-is

        self.request_counter += 1;
        let request_id = format!("req_{}", self.request_counter);

        let request = MarketplaceRequest {
            id: request_id.clone(),
            owner_wallet: owner_wallet.clone(),
            store_name,
            type_of_goods,
            signature,
            timestamp: env::time_now(),
            approved: false,
        };

        self.marketplace_requests.insert(request_id.clone(), request)?;

        app::emit!(MarketplaceAppEvent::MarketplaceRequested {
            request_id: &request_id,
            owner_wallet: &owner_wallet,
        });

        Ok(request_id)
    }

    pub fn admin_approve_marketplace(
        &mut self,
        request_id: String,
        context_id: String,
    ) -> app::Result<String> {
        if self.mode != AppMode::ContextManager {
            app::bail!("This method is only available in ContextManager mode");
        }

        app::log!("Admin approving marketplace request: {}", request_id);

        // TODO: Add caller verification to ensure only admin can call this
        // For now, we trust the caller

        let mut request = self.marketplace_requests.get(&request_id)?
            .expect("Request not found");

        request.approved = true;
        self.marketplace_requests.insert(request_id.clone(), request.clone())?;

        self.marketplace_counter += 1;
        let marketplace_id = format!("market_{}", self.marketplace_counter);

        let marketplace = MarketplaceInfo {
            id: marketplace_id.clone(),
            owner_wallet: request.owner_wallet.clone(),
            store_name: request.store_name,
            type_of_goods: request.type_of_goods,
            context_id,
            created_at: env::time_now(),
        };

        self.marketplaces.insert(marketplace_id.clone(), marketplace)?;

        app::emit!(MarketplaceAppEvent::MarketplaceApproved {
            marketplace_id: &marketplace_id,
            owner_wallet: &request.owner_wallet,
        });

        Ok(marketplace_id)
    }

    pub fn get_all_marketplaces(&self) -> app::Result<String> {
        if self.mode != AppMode::ContextManager {
            app::bail!("This method is only available in ContextManager mode");
        }

        app::log!("Getting all marketplaces");
        let marketplaces: BTreeMap<String, MarketplaceInfo> = self.marketplaces.entries()?.collect();
        let json = calimero_sdk::serde_json::to_string(&marketplaces)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_pending_requests(&self) -> app::Result<String> {
        if self.mode != AppMode::ContextManager {
            app::bail!("This method is only available in ContextManager mode");
        }

        app::log!("Getting pending marketplace requests");
        let all_requests: BTreeMap<String, MarketplaceRequest> = self.marketplace_requests.entries()?.collect();
        let pending: Vec<&MarketplaceRequest> = all_requests.values()
            .filter(|r| !r.approved)
            .collect();
        let json = calimero_sdk::serde_json::to_string(&pending)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_admin_address(&self) -> app::Result<String> {
        if self.mode != AppMode::ContextManager {
            app::bail!("This method is only available in ContextManager mode");
        }

        Ok(self.admin_address.clone().unwrap_or_default())
    }

    // ========================================================================
    // Marketplace methods
    // ========================================================================

    pub fn request_seller_access(
        &mut self,
        wallet_address: String,
        company_name: String,
        company_details: String,
        signature: String,
    ) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Seller access request from: {}", wallet_address);

        // TODO: Verify Ethereum signature

        self.seller_counter += 1;
        let seller_id = format!("seller_{}", self.seller_counter);

        let request = SellerRequest {
            id: seller_id.clone(),
            wallet_address: wallet_address.clone(),
            company_name,
            company_details,
            signature,
            timestamp: env::time_now(),
            approved: false,
        };

        self.seller_requests.insert(seller_id.clone(), request)?;

        app::emit!(MarketplaceAppEvent::SellerRequested {
            seller_id: &seller_id,
            wallet: &wallet_address,
        });

        Ok(seller_id)
    }

    pub fn owner_approve_seller(&mut self, seller_id: String) -> app::Result<()> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Owner approving seller: {}", seller_id);

        // TODO: Verify caller is owner

        let mut request = self.seller_requests.get(&seller_id)?
            .expect("Seller request not found");

        request.approved = true;
        self.seller_requests.insert(seller_id.clone(), request.clone())?;

        let seller_info = SellerInfo {
            id: seller_id.clone(),
            wallet_address: request.wallet_address,
            company_name: request.company_name,
            company_details: request.company_details,
            approved_at: env::time_now(),
        };

        self.sellers.insert(seller_id.clone(), seller_info)?;

        app::emit!(MarketplaceAppEvent::SellerApproved { seller_id: &seller_id });

        Ok(())
    }

    pub fn add_product(
        &mut self,
        seller_wallet: String,
        name: String,
        description: String,
        quantity: u32,
        price: String,
        image_url: String,
        category: String,
        shipping_info: String,
        _signature: String,
    ) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Adding product: {} by seller: {}", name, seller_wallet);

        // TODO: Verify signature and find seller by wallet
        // For now, we'll create a simple seller lookup
        let seller_id = self.find_seller_by_wallet(&seller_wallet)?;

        self.product_counter += 1;
        let product_id = format!("prod_{}", self.product_counter);

        let product = Product {
            id: product_id.clone(),
            seller_id: seller_id.clone(),
            name,
            description,
            quantity,
            price,
            image_url,
            category,
            shipping_info,
            created_at: env::time_now(),
        };

        self.products.insert(product_id.clone(), product)?;

        app::emit!(MarketplaceAppEvent::ProductAdded {
            product_id: &product_id,
            seller_id: &seller_id,
        });

        Ok(product_id)
    }

    pub fn purchase_product(
        &mut self,
        product_id: String,
        buyer_wallet: String,
        amount: String,
        _signature: String,
    ) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Purchase request for product: {} by buyer: {}", product_id, buyer_wallet);

        // TODO: Verify signature

        let mut product = self.products.get(&product_id)?
            .expect("Product not found");

        if product.quantity == 0 {
            app::bail!("Insufficient quantity");
        }

        product.quantity -= 1;
        self.products.insert(product_id.clone(), product.clone())?;

        self.order_counter += 1;
        let order_id = format!("order_{}", self.order_counter);

        // Generate QR payload (short link with delivery confirmation data)
        let qr_payload = self.generate_qr_payload(&order_id, &buyer_wallet, &amount);

        let order = Order {
            id: order_id.clone(),
            buyer_wallet: buyer_wallet.clone(),
            product_id: product_id.clone(),
            seller_id: product.seller_id,
            amount,
            escrow_status: EscrowStatus::Pending,
            qr_payload,
            created_at: env::time_now(),
            delivered_at: None,
        };

        self.orders.insert(order_id.clone(), order)?;

        app::emit!(MarketplaceAppEvent::OrderCreated {
            order_id: &order_id,
            buyer_wallet: &buyer_wallet,
        });

        Ok(order_id)
    }

    pub fn get_delivery_payload(&self, order_id: String) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Getting delivery payload for order: {}", order_id);

        let order = self.orders.get(&order_id)?
            .expect("Order not found");

        Ok(order.qr_payload)
    }

    pub fn confirm_delivery(&mut self, order_id: String, _buyer_signature: String) -> app::Result<()> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Confirming delivery for order: {}", order_id);

        // TODO: Verify buyer signature matches the order buyer

        let mut order = self.orders.get(&order_id)?
            .expect("Order not found");

        order.escrow_status = EscrowStatus::Released;
        order.delivered_at = Some(env::time_now());

        self.orders.insert(order_id.clone(), order)?;

        app::emit!(MarketplaceAppEvent::DeliveryConfirmed { order_id: &order_id });

        Ok(())
    }

    pub fn get_products(&self) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Getting all products");
        let products: BTreeMap<String, Product> = self.products.entries()?.collect();
        let json = calimero_sdk::serde_json::to_string(&products)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_sellers(&self) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Getting all sellers");
        let sellers: BTreeMap<String, SellerInfo> = self.sellers.entries()?.collect();
        let json = calimero_sdk::serde_json::to_string(&sellers)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_pending_seller_requests(&self) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Getting pending seller requests");
        let all_requests: BTreeMap<String, SellerRequest> = self.seller_requests.entries()?.collect();
        let pending: Vec<&SellerRequest> = all_requests.values()
            .filter(|r| !r.approved)
            .collect();
        let json = calimero_sdk::serde_json::to_string(&pending)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_orders(&self) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Getting all orders");
        let orders: BTreeMap<String, Order> = self.orders.entries()?.collect();
        let json = calimero_sdk::serde_json::to_string(&orders)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_order(&self, order_id: String) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        app::log!("Getting order: {}", order_id);
        let order = self.orders.get(&order_id)?
            .expect("Order not found");
        let json = calimero_sdk::serde_json::to_string(&order)
            .expect("Failed to serialize JSON");
        Ok(json)
    }

    pub fn get_owner_wallet(&self) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        Ok(self.owner_wallet.clone().unwrap_or_default())
    }

    pub fn get_marketplace_id(&self) -> app::Result<String> {
        if self.mode != AppMode::Marketplace {
            app::bail!("This method is only available in Marketplace mode");
        }

        Ok(self.marketplace_id.clone().unwrap_or_default())
    }

    // ========================================================================
    // Helper methods
    // ========================================================================

    fn find_seller_by_wallet(&self, wallet: &str) -> app::Result<String> {
        let sellers: BTreeMap<String, SellerInfo> = self.sellers.entries()?.collect();
        for (id, seller) in sellers {
            if seller.wallet_address == wallet {
                return Ok(id);
            }
        }
        app::bail!("Seller not found for wallet: {}", wallet)
    }

    fn generate_qr_payload(&self, order_id: &str, buyer_wallet: &str, amount: &str) -> String {
        // Generate a short link payload for QR code
        // Format: base_url/confirm/{order_id}?buyer={buyer_wallet}&amount={amount}
        // In production, this would be a properly signed JWT or similar
        format!(
            "https://marketplace.calimero.network/confirm/{}?buyer={}&amount={}",
            order_id, buyer_wallet, amount
        )
    }
}
