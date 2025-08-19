'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Comment {
  id: number;
  username: string;
  comment: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('guest');
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState('success');
  const [storedFlag, setStoredFlag] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setComments(data.comments);
          // Heuristic: if any stored comment contains HTML/script-like content, surface the stored XSS flag
          // Stored XSS is rendered below via dangerouslySetInnerHTML
        }
      };
      fetchProduct();
    }
  }, [id]);

  // Execute any <script>...</script> found in comments (intentionally unsafe for the challenge)
  useEffect(() => {
    const joined = comments.map(c => c.comment || '').join('\n');
    const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(joined))) {
      const s = document.createElement('script');
      s.textContent = m[1];
      document.body.appendChild(s);
      s.remove();
    }
  }, [comments]);

  // Seed cookie to allow server-side flag issuance for stored XSS
  useEffect(() => {
    fetch('/api/xss/stored/seed').catch(() => {});
  }, []);

  // Hook window.alert to fetch and reveal the stored XSS flag when any alert fires
  useEffect(() => {
    const orig = window.alert;
    (window as any).alert = async (msg: any) => {
      try {
        const res = await fetch('/api/xss/stored/flag');
        if (res.ok) {
          const data = await res.json();
          if (data?.flag) {
            setStoredFlag(data.flag);
            return orig.call(window, data.flag);
          }
        }
      } catch {}
      return orig.call(window, msg);
    };
    return () => { window.alert = orig; };
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch(`/api/products/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, comment: newComment }),
    });

    if (res.ok) {
      const addedComment = await res.json();
      setComments([...comments, addedComment]);
      setNewComment('');
      setMessage('Comment posted successfully!');
      setMessageVariant('success');
      // No auto-flag; attackers' JS should exfiltrate the DOM secret
    } else {
      setMessage('Failed to post comment.');
      setMessageVariant('danger');
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <Row>
      <Col md={6}>
        <img src={product.image || '/images/placeholder.jpg'} alt={product.name} className="img-fluid rounded shadow" />
        <h2 className="mt-3">{product.name}</h2>
        <p className="text-muted">{product.description}</p>
        <h4>${product.price.toFixed(2)}</h4>
      </Col>
      <Col md={6}>
        <h3>Comments</h3>
        <Card>
          <Card.Body>
            <Form onSubmit={handleCommentSubmit}>
              {message && <Alert variant={messageVariant}>{message}</Alert>}
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a display name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Leave a Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts... (Scripts are welcome!)"
                />
              </Form.Group>
              <Button type="submit" variant="primary">Submit</Button>
            </Form>
          </Card.Body>
        </Card>
        <div className="mt-4">
          {/* Stored XSS: This page fetches the flag server-side when alert() fires */}
          {storedFlag && (
            <Alert variant="success"><strong>Flag:</strong> <code>{storedFlag}</code></Alert>
          )}
          {comments.map((comment) => (
            <Card className="mb-2" key={comment.id}>
              <Card.Body>
                <Card.Title as="h6">{comment.username}</Card.Title>
                {/* VULNERABILITY: Stored XSS */}
                <div dangerouslySetInnerHTML={{ __html: comment.comment }} />
                <Card.Text>
                  <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Col>
    </Row>
  );
}
