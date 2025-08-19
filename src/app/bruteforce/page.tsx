'use client';

import { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';

const defaultWordlist = [
  '123456',
  'password',
  'qwerty',
  '111111',
  'abc123',
  'letmein',
  'monkey',
  'dragon',
  'password1',
  'password123',
].join('\n');

export default function BruteForcePage() {
  const [username, setUsername] = useState('alice');
  const [wordlist, setWordlist] = useState(defaultWordlist);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ password: string; flag?: string } | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const runBruteforce = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setError('');
    setResult(null);
    setProgress(0);

    const candidates = wordlist.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    for (let i = 0; i < candidates.length; i++) {
      const pw = candidates[i];
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: pw }),
        });
        const data = await res.json();
        setProgress(Math.round(((i + 1) / candidates.length) * 100));
        if (res.ok) {
          let flag: string | undefined;
          try {
            const fres = await fetch('/api/flags/by-name?name=' + encodeURIComponent('Brute Force'));
            const fdata = await fres.json();
            flag = fdata.flag;
          } catch {}
          setResult({ password: pw, flag });
          setRunning(false);
          return;
        }
      } catch (err) {
        setError('Request failed.');
        break;
      }
      // Small delay to be friendly
      await new Promise(r => setTimeout(r, 150));
    }
    setRunning(false);
    if (!result) setError('No password matched. Try expanding the wordlist.');
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">Brute Force</Card.Title>
        <Card.Text>
          Try common passwords for a target username. This demonstrates why weak passwords are risky.
        </Card.Text>
        <Form onSubmit={runBruteforce}>
          {error && <Alert variant="danger">{error}</Alert>}
          {result && (
            <Alert variant="success">
              <Alert.Heading>Match Found!</Alert.Heading>
              <div>Username: <code>{username}</code></div>
              <div>Password: <code>{result.password}</code></div>
              {result.flag && (
                <div className="mt-2">Flag: <code>{result.flag}</code></div>
              )}
            </Alert>
          )}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Username</Form.Label>
              <Form.Control value={username} onChange={e => setUsername(e.target.value)} />
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Button type="submit" variant="primary" disabled={running} className="w-100">
                {running ? 'Running...' : 'Run'}
              </Button>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Wordlist (one per line)</Form.Label>
            <Form.Control as="textarea" rows={8} value={wordlist} onChange={e => setWordlist(e.target.value)} />
          </Form.Group>
          {running && <ProgressBar animated now={progress} label={`${progress}%`} />}
        </Form>
      </Card.Body>
    </Card>
  );
}
