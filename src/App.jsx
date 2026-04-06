import { useState } from 'react'
import TaxEngineHub from './components/TaxEngineHub'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#003087] to-[#1d4ed8] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">🧮</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Central Tax Engine</h1>
              <p className="text-sm text-blue-200 mt-0.5">Global tax intelligence powered by Tapestry Compliance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <TaxEngineHub />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          <p>Central Tax Engine | Integrations powered by <a href="https://database.tapestrycompliance.com/" target="_blank" rel="noopener noreferrer" className="text-[#003087] font-semibold hover:underline">Tapestry Compliance</a></p>
        </div>
      </footer>
    </div>
  )
}
