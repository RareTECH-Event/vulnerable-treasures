'use client';

import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';

export default function NetworkPage() {
  const [host, setHost] = useState('8.8.8.8');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput('');
    
    const response = await fetch('/api/network/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host }),
    });

    const data = await response.json();
    setLoading(false);
    setOutput(data.output);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">Network Utility</Card.Title>
        <Card.Text>
          Use this tool to ping an IP address and check network connectivity.
        </Card.Text>
        <Form onSubmit={handlePing}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Pinging...' : 'Ping'}
          </Button>
        </Form>
        {output && (
          <pre className="bg-dark text-white p-3 rounded mt-3">
            <code>{output}</code>
          </pre>
        )}
        <hr className="my-4" />
        <div>
          <h5>Helpful Links</h5>
          <ul>
            <li>
              <a href="/api/fetch?url=https://example.com">
                URL Fetcher (try fetching https://example.com)
              </a>
            </li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
}
