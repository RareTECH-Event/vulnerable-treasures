'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Alert } from 'react-bootstrap';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const flags: Record<string, string> | undefined = data.flags;
      if (data.flag && data.user?.username === 'alice') {
        router.push('/dashboard?alice=true');
        return;
      }
      if (flags?.adminLogin) {
        router.push('/dashboard?admin=true');
      } else if (flags?.authBypass) {
        router.push('/dashboard?bypass=true');
      } else {
        if (data.user?.role === 'admin') {
          router.push('/dashboard?admin=true');
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      setError(data.message || 'An error occurred.');
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Card style={{ width: '24rem' }}>
        <Card.Body>
          <Card.Title as="h2" className="text-center">Login</Card.Title>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
