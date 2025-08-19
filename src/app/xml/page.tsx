'use client';

import { useState } from 'react';
import { Button, Card, Form, Alert } from 'react-bootstrap';

const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <item>
    <name>Ancient Vase</name>
    <price>120.00</price>
  </item>
</data>`;

export default function XmlParserPage() {
  const [xml, setXml] = useState(defaultXml);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [flag, setFlag] = useState('');

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOutput('');

    const response = await fetch('/api/xml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    });

    const data = await response.json();

    if (response.ok) {
      setOutput(JSON.stringify(data, null, 2));
      // When DOCTYPE is present, server includes flag in the JSON body
      const bodyFlag = (data?.data && (data.data.flag || data.data.test)) || '';
      setFlag(typeof bodyFlag === 'string' && bodyFlag.startsWith('CTF{') ? bodyFlag : '');
    } else {
      setError(data.message);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">XML Parser</Card.Title>
        <Card.Text>
          Submit XML data to be parsed by the server.
        </Card.Text>
        <Form onSubmit={handleParse}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={10}
              value={xml}
              onChange={(e) => setXml(e.target.value)}
              className="font-monospace"
            />
          </Form.Group>
          <Button variant="primary" type="submit">Parse XML</Button>
        </Form>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {flag && (
          <Alert variant="success" className="mt-3">
            <Alert.Heading>Flag Captured!</Alert.Heading>
            <p className="font-monospace">{flag}</p>
          </Alert>
        )}
        {output && (
          <div className="mt-3">
            <h5>Parsed Output:</h5>
            <pre className="bg-dark text-white p-3 rounded">
              <code>{output}</code>
            </pre>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
