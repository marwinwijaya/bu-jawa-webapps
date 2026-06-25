import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brown-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-2">Rumah Makan Bu Jawa</h3>
            <p className="text-brown-200 text-sm">
              Masakan Jawa autentik dengan cita rasa rumahan
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Menu</h4>
            <ul className="space-y-2 text-sm text-brown-200">
              <li><Link to="/" className="hover:text-white">Beranda</Link></li>
              <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
              <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm text-brown-200">
              <li>
                <a
                  href="https://wa.me/62895405718033"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp: 0895-4057-18033
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/XNuEpTYSbn5omncMA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Lokasi di Google Maps
                </a>
              </li>
              <li>Buka setiap hari: 09.00 - 21.00 WIB</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brown-700 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-brown-300">
          <p>© 2024 Rumah Makan Bu Jawa. All rights reserved.</p>
          <Link to="/admin/login" className="hover:text-white mt-2 sm:mt-0">
            Akses Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
