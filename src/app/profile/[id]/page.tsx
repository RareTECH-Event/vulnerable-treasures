'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Alert } from 'react-bootstrap';

interface UserProfile {
  id: number;
  username: string;
  role: string;
  flag?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        const res = await fetch(`/api/profile/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setProfile(data);
        } else {
          setError(data.message);
        }
      };
      fetchProfile();
    }
  }, [id]);

  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">User Profile</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {profile ? (
          <div>
            <p><strong>User ID:</strong> {profile.id}</p>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            {profile.flag && (
              <Alert variant="success" className="mt-3">
                <Alert.Heading>Flag Captured!</Alert.Heading>
                <p className="font-monospace">{profile.flag}</p>
              </Alert>
            )}
          </div>
        ) : (
          !error && <p>Loading...</p>
        )}
      </Card.Body>
    </Card>
  );
}
