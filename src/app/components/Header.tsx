'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar } from 'react-bootstrap';

export default function Header() {
  const pathname = usePathname() || '/';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/">Vulnerable Treasures</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/" active={isActive('/')}>Home</Nav.Link>
            <Nav.Link as={Link} href="/products" active={isActive('/products')}>Products</Nav.Link>
            <Nav.Link as={Link} href="/challenges" active={isActive('/challenges')}>Challenges</Nav.Link>
            <Nav.Link as={Link} href="/network" active={isActive('/network')}>Network</Nav.Link>
            <Nav.Link as={Link} href="/xml" active={isActive('/xml')}>XML</Nav.Link>
            <Nav.Link as={Link} href="/files" active={isActive('/files')}>Files</Nav.Link>
            <Nav.Link as={Link} href="/profile/2" active={isActive('/profile')}>My Profile</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} href="/login" active={isActive('/login')}>Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
