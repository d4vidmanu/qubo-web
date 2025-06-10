"use client"

import { useState } from "react"
import { AuthModal } from "./auth-modal"

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Qubo</h1>
            </div>

            <nav className="flex items-center space-x-6">
              <button className="text-gray-700 hover:text-blue-600 font-medium">Página Principal</button>
              <button
                onClick={() => handleAuthClick("login")}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleAuthClick("register")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Registrarse
              </button>
            </nav>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}
