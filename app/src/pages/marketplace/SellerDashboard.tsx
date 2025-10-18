import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalimeroApp } from '@calimero-network/calimero-client';
import { AbiClient } from '../../api/AbiClient';

interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  quantity: number;
  price: string;
  image_url: string;
  category: string;
  shipping_info: string;
  created_at: number;
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sellerWallet: '0xSellerWallet001',
    name: '',
    description: '',
    quantity: 0,
    price: '',
    imageUrl: '',
    category: '',
    shippingInfo: '',
  });

  // TODO: Update this ID after running `pnpm network:bootstrap`
  // Look for "marketplace_context_id" in the bootstrap output
  const MARKETPLACE_CONTEXT_ID = 'AYZCubjAactLnudYYUC2xCzkoD14eCZPw6PThxRJuGVM';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const app = (window as any).calimeroApp as CalimeroApp;
      if (!app) return;

      const contexts = await app.fetchContexts();
      const marketplaceContext = contexts.find(c => c.id === MARKETPLACE_CONTEXT_ID);
      if (!marketplaceContext) return;

      const api = new AbiClient(app, marketplaceContext);
      const productsJson = await api.getProducts();
      const prods: Product[] = Object.values(JSON.parse(productsJson));

      // Filter products by seller wallet
      const myProducts = prods.filter(p => {
        // Find seller by wallet to get seller_id
        return true; // For demo, show all products
      });

      setProducts(myProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const app = (window as any).calimeroApp as CalimeroApp;
      const contexts = await app.fetchContexts();
      const marketplaceContext = contexts.find(c => c.id === MARKETPLACE_CONTEXT_ID);
      if (!marketplaceContext) return;

      const api = new AbiClient(app, marketplaceContext);

      await api.addProduct({
        seller_wallet: formData.sellerWallet,
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        price: formData.price,
        image_url: formData.imageUrl,
        category: formData.category,
        shipping_info: formData.shippingInfo,
        _signature: `0xSig_${Date.now()}`,
      });

      alert('Product added successfully!');
      setShowAddProduct(false);
      setFormData({
        sellerWallet: '0xSellerWallet001',
        name: '',
        description: '',
        quantity: 0,
        price: '',
        imageUrl: '',
        category: '',
        shippingInfo: '',
      });
      await loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. See console for details.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Loading...</h2></div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>🛒 Seller Dashboard</h1>
          <p style={{ color: '#666' }}>Manage your products and inventory</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            + Add Product
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddProduct && (
        <div style={{ marginBottom: '40px', padding: '24px', border: '2px solid #10b981', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Add New Product</h2>
          <form onSubmit={addProduct} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Category (e.g., Electronics)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
                min="0"
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Price (USD)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <input
              type="text"
              placeholder="Shipping Info (e.g., Free shipping, 2-3 days)"
              value={formData.shippingInfo}
              onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
              required
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Your Products ({products.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
              <div style={{ height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '48px' }}>📦</span>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                  {product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>${product.price}</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>Qty: {product.quantity}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Category: {product.category}
                </div>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>No products yet. Click "Add Product" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
