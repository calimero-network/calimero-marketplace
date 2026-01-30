import React, { useState, useEffect } from 'react';

export default function TestInventory() {
  const [status, setStatus] = useState<string>('Loading...');
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setStatus('Testing API connection...');

      // Test direct API call to get products
      const response = await fetch('http://localhost:2528/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'execute',
          params: {
            contextId: 'A2gohzYWwdgguTs4frBMpctuMTY7gwTDFG5BtZ1UN28L',
            method: 'get_products',
            argsJson: {},
            executorPublicKey: 'J4r3jAQRPm8xc4TAV4hDVCd1UAvDekGMa9MKrcUg8KDs',
          },
        }),
      });

      const data = await response.json();
      setStatus('API Response received!');

      if (data.result?.output) {
        const productsData = JSON.parse(data.result.output);
        const productsArray = Object.values(productsData);
        setProducts(productsArray);
        setStatus(`✅ SUCCESS! Found ${productsArray.length} products`);
      } else {
        setError('No products in response');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setStatus('❌ FAILED');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔍 Inventory Test Page</h1>

      <div
        style={{
          padding: '20px',
          backgroundColor: error ? '#fee' : '#efe',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h2>Status: {status}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Configuration:</h3>
        <ul>
          <li>Application ID: BNL3n4b5oxe4X94SgNCFFNPgHxQVMRzdzRb2Dj2XvqgV</li>
          <li>Context ID: A2gohzYWwdgguTs4frBMpctuMTY7gwTDFG5BtZ1UN28L</li>
          <li>API Endpoint: http://localhost:2528/jsonrpc</li>
        </ul>
      </div>

      {products.length > 0 && (
        <div>
          <h2>Products Found:</h2>
          <div
            style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {products.map((product: any) => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff',
                }}
              >
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>
                  <strong>Price:</strong> ${product.price}
                </p>
                <p>
                  <strong>Quantity:</strong> {product.quantity}
                </p>
                <p>
                  <strong>Category:</strong> {product.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
