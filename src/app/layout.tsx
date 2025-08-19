import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import { Container } from 'react-bootstrap';

export const metadata = {
  title: 'Vulnerable Treasures',
  description: 'A CTF application for learning web security',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          
          <main className="flex-grow-1">
            <Container className="mt-4">
              {children}
            </Container>
          </main>

          <footer className="bg-dark text-white text-center p-3 mt-auto">
            <p>&copy; {new Date().getFullYear()} Vulnerable Treasures. For educational purposes only.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
