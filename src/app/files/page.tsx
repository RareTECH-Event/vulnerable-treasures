'use client';

import { useState } from 'react';
import { Button, Card, Form, Alert } from 'react-bootstrap';

export default function FilesPage() {
  const [filePath, setFilePath] = useState('notice.txt');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState('');

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOutput('');
    setLoading(true);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to fetch file');
      } else {
        const text = await res.text();
        setOutput(text);
        setFlag(res.headers.get('X-Flag') || '');
      }
    } catch (err) {
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">File Viewer</Card.Title>
        <Card.Text>
          Read files from the server by specifying a relative path.
        </Card.Text>
        <Form onSubmit={handleFetch}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="e.g. notice.txt or ../../flag.txt"
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Read File'}
          </Button>
        </Form>
        {flag && (
          <div className="alert alert-success mt-3">
            <strong>Flag:</strong> <code>{flag}</code>
          </div>
        )}
        {output && (
          <div className="mt-3">
            <h5>Contents:</h5>
            <pre className="bg-dark text-white p-3 rounded">
              <code>{output}</code>
            </pre>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
