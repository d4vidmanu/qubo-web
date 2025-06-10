"use client"

import { useState, useEffect, useRef } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleStep1Continue = () => {
    if (email.trim()) {
      setStep(2)
    }
  }

  const handleAuthSubmit = () => {
    window.location.href = "/teach"
  }

  const resetModal = () => {
    setStep(1)
    setEmail("")
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
      onClose={resetModal}
    >
      <button onClick={resetModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <XMarkIcon className="w-6 h-6" />
      </button>

      {step === 1 ? (
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Empieza como un profesor</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={handleStep1Continue}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={!email.trim()}
            >
              Continuar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          {mode === "register" ? (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Crea tu cuenta como un profesor</h2>
                <button
                  onClick={() => onModeChange("login")}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  ¿Ya tienes una cuenta? Inicia Sesión aquí
                </button>
              </div>

              <div className="space-y-4">
                <input type="email" placeholder="email" defaultValue={email} className="w-full px-4 py-2 border rounded-md" />
                <input type="password" placeholder="contraseña" className="w-full px-4 py-2 border rounded-md" />
                <input type="password" placeholder="repite la contraseña" className="w-full px-4 py-2 border rounded-md" />
                <input type="text" placeholder="nombre" className="w-full px-4 py-2 border rounded-md" />
                <input type="text" placeholder="apellido" className="w-full px-4 py-2 border rounded-md" />
                <input type="text" placeholder="dni" className="w-full px-4 py-2 border rounded-md" />
                <input type="tel" placeholder="número de celular" className="w-full px-4 py-2 border rounded-md" />

                <button
                  onClick={handleAuthSubmit}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Registrarse
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Inicia sesión en Qubo</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  defaultValue={email}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full px-4 py-2 border rounded-md"
                />

                <button
                  onClick={handleAuthSubmit}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Iniciar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
