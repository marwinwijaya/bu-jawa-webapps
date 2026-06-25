import { HashRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-cream">
        <header className="bg-brown text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Rumah Makan Bu Jawa</h1>
            <p className="text-cream-dark">Masakan Jawa Autentik</p>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold text-brown-dark mb-4">
                  Selamat Datang
                </h2>
                <p className="text-lg text-brown">
                  Menu segera hadir...
                </p>
              </div>
            } />
          </Routes>
        </main>

        <footer className="bg-green-leaf text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2026 Rumah Makan Bu Jawa. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  )
}

export default App
