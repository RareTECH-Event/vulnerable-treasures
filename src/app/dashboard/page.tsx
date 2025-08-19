'use client';

import { useEffect, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';

interface User {
  username: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bypass, setBypass] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [aliceFlag, setAliceFlag] = useState(false);

  useEffect(() => {
    // This is a mock user object. In a real app, you'd get this from a session.
    // For now, we simulate a logged-in user.
    // We will replace this with actual session data later if needed.
    const mockUser = { username: 'user', role: 'user' };
    
    const params = new URLSearchParams(window.location.search);
    const isBypass = params.get('bypass') === 'true';
    const isAdmin = params.get('admin') === 'true';
    const isAlice = params.get('alice') === 'true';
    setBypass(isBypass);
    setAdminLogin(isAdmin);
    setAliceFlag(isAlice);
    if (isAdmin) {
      mockUser.username = 'admin';
      mockUser.role = 'admin';
    }
    setUser(mockUser);
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">Welcome, {user.username}!</Card.Title>
        <Card.Text>
          This is your dashboard.
        </Card.Text>
        <Card>
          <Card.Header>Your Profile</Card.Header>
          <Card.Body>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </Card.Body>
        </Card>
        {bypass && <FlagAlert title="Auth Bypass Flag" name="SQL Injection - Auth Bypass" body="You bypassed authentication successfully." />}
        {adminLogin && <FlagAlert title="Admin Flag Captured" name="Admin Password" body="Congratulations! You have successfully logged in as admin." />}
        {aliceFlag && <FlagAlert title="Brute Force Flag" name="Brute Force" body="You logged in with a weak password." />}
      </Card.Body>
    </Card>
  );
}

function FlagAlert({ title, name, body }: { title: string; name: string; body: string }) {
  const [flag, setFlag] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/flags/by-name?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        setFlag(data.flag || null);
      } catch {}
    };
    load();
  }, [name]);
  return (
    <Alert variant="success" className="mt-4">
      <Alert.Heading>{title}!</Alert.Heading>
      <p>{body}</p>
      <hr />
      <p className="mb-0 font-monospace">{flag || '...'}</p>
    </Alert>
  );
}
