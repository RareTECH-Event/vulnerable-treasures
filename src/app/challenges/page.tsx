'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Accordion, Alert, Row, Col, Modal } from 'react-bootstrap';
import Confetti from '@/app/components/Confetti';

interface Challenge {
  id: number;
  title: string;
  description: string;
  captured: boolean;
}

export default function Challenges() {
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState('success');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const fetchChallenges = async () => {
    const res = await fetch('/api/challenges');
    const data = await res.json();
    setChallenges(data);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Celebrate when all challenges are captured
  const allCaptured = useMemo(() => challenges.length > 0 && challenges.every(c => c.captured), [challenges]);
  useEffect(() => {
    if (allCaptured) {
      setCelebrate(true);
      setShowCongrats(true);
      const t = setTimeout(() => setCelebrate(false), 3500);
      return () => clearTimeout(t);
    }
  }, [allCaptured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag) return;

    const response = await fetch('/api/flags/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag }),
    });

    const data = await response.json();
    
    if (response.ok) {
      setMessageVariant('success');
      setFlag('');
      fetchChallenges();
    } else {
      setMessageVariant('danger');
    }
    setMessage(data.message);
  };

  return (
    <Row>
      {celebrate && <Confetti duration={3200} />}
      <Modal show={showCongrats} onHide={() => setShowCongrats(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Congratulations! 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">All challenges have been captured.</p>
          <p className="mb-0">Great job — treasure secured! Please send this screenshot to Sleek.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowCongrats(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Col md={8}>
        <Card>
          <Card.Body>
            <Card.Title as="h2">Challenge List</Card.Title>
            <Accordion>
              {challenges.map((challenge, index) => (
                <Accordion.Item eventKey={String(index)} key={challenge.id}>
                  <Accordion.Header>
                    <span className={challenge.captured ? 'text-success' : ''}>
                      {challenge.title}
                      {challenge.captured && ' - Captured!'}
                    </span>
                  </Accordion.Header>
                  <Accordion.Body>
                    {challenge.description}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <Card.Title as="h2">Submit a Flag</Card.Title>
            <Form onSubmit={handleSubmit}>
              {message && <Alert variant={messageVariant}>{message}</Alert>}
              <Form.Group className="mb-3" controlId="flag">
                <Form.Control
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="CTF{...}"
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100">Submit</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
