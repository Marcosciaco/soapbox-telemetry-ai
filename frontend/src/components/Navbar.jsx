import React from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-90">
          <Zap className="w-8 h-8" />
          Soapbox Telemetry AI
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:opacity-80 transition">
            Dashboard
          </Link>
          <Link to="/upload" className="hover:opacity-80 transition">
            Upload
          </Link>
          <Link to="/laps" className="hover:opacity-80 transition">
            Laps
          </Link>
          <Link to="/tire" className="hover:opacity-80 transition">
            Tire
          </Link>
          <Link to="/weight" className="hover:opacity-80 transition">
            Weight
          </Link>
          <Link to="/training" className="hover:opacity-80 transition">
            Training
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
