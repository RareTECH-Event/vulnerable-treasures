'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Form, Row, Col } from 'react-bootstrap';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');
  const [rxssFlag, setRxssFlag] = useState('');
  const [scriptContent, setScriptContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();
    setProducts(data);
    setSearchedTerm(searchTerm);
    const m = searchTerm.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    setScriptContent(m ? m[1] : null);
  };

  // If script tags are provided in the reflected input, execute them (intentionally unsafe for challenge)
  useEffect(() => {
    // Seed cookie to allow server-side flag issuance
    fetch('/api/xss/reflected/seed').catch(() => {});
    if (scriptContent) {
      const s = document.createElement('script');
      s.textContent = scriptContent;
      document.body.appendChild(s);
      s.remove();
    }
  }, [scriptContent]);

  // Hook window.alert to grant the reflected XSS flag when any alert fires
  useEffect(() => {
    const orig = window.alert;
    (window as any).alert = async (msg: any) => {
      try {
        const res = await fetch('/api/xss/reflected/flag');
        if (res.ok) {
          const data = await res.json();
          if (data?.flag) {
            setRxssFlag(data.flag);
            return orig.call(window, data.flag);
          }
        }
      } catch {}
      return orig.call(window, msg);
    };
    return () => {
      window.alert = orig;
    };
  }, [rxssFlag]);

  return (
    <div>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title as="h2">Search Products</Card.Title>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col xs={9}>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for treasures..."
                />
              </Col>
              <Col xs={3}>
                <Button type="submit" variant="primary" className="w-100">Search</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {searchedTerm && (
        <div className="mb-4">
          <h3>
            Results for: <span className="text-primary" dangerouslySetInnerHTML={{ __html: searchedTerm }} />
          </h3>
          {/* Reflected XSS: This page fetches the flag server-side when alert() fires */}
        </div>
      )}

      <Row xs={1} md={2} lg={3} className="g-4">
        {products.map((product) => (
          <Col key={product.id}>
            <Card className="h-100">
              <Card.Img variant="top" src={product.image || '/images/placeholder.jpg'} style={{ height: '200px', objectFit: 'cover' }} />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="flex-grow-1">{product.description}</Card.Text>
                <Card.Text as="h4">${Number(product.price).toFixed(2)}</Card.Text>
                <Button as={Link} href={`/products/${product.id}`} variant="primary" className="mt-auto">View Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
