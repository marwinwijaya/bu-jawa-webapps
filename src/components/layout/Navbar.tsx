import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/menu', label: 'Menu' },
    { to: '/gallery', label: 'Gallery' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl text-brown-600">
            Bu Jawa
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-brown-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://wa.me/62895405718033?text=Halo%20Bu%20Jawa%2C%20saya%20mau%20bertanya"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="whatsapp" size="sm">
                Pesan Sekarang
              </Button>
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-gray-700 hover:text-brown-600"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://wa.me/62895405718033?text=Halo%20Bu%20Jawa%2C%20saya%20mau%20bertanya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2"
            >
              <Button variant="whatsapp" size="sm">
                Pesan Sekarang
              </Button>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
