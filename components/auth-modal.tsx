"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export function AuthModal({
  isOpen,
  onClose,
  mode,
  onModeChange,
}: AuthModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  const handleStep1Continue = () => {
    if (email.trim()) setStep(2);
  };

  const setAuthCookies = (token: string, user_id: string) => {
    // basic client‐side cookies
    document.cookie = `token=${token}; path=/;`;
    document.cookie = `user_id=${user_id}; path=/;`;
  };

  const handleRegister = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/auth/register-teacher`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "teacher",
            email,
            password,
            name,
            lastName,
            dni,
            phoneNumber,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrarse.");
        return;
      }
      setAuthCookies(data.token, data.user_id);
      window.location.href = "/teach";
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión.");
        return;
      }
      setAuthCookies(data.token, data.user_id);
      window.location.href = "/teach";
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setLastName("");
    setDni("");
    setPhoneNumber("");
    setError("");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
      onClose={resetModal}
    >
      <button
        onClick={resetModal}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {step === 1 ? (
        /* Step 1: just collect email */
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Empieza como un profesor
            </h2>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
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
        /* Step 2: register OR login */
        <div className="space-y-6 pt-4">
          {mode === "register" ? (
            /* — REGISTER — */
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Crea tu cuenta como un profesor
                </h2>
                <button
                  onClick={() => onModeChange("login")}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  ¿Ya tienes una cuenta? Inicia Sesión aquí
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2 border rounded-md bg-gray-100"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="tel"
                  placeholder="Número de celular"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Registrarse"}
                </button>
              </div>
            </>
          ) : (
            /* — LOGIN — */
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Inicia sesión en Qubo
                </h2>
                <button
                  onClick={() => onModeChange("register")}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  ¿No tienes cuenta? Regístrate aquí
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2 border rounded-md bg-gray-100"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Ingresando..." : "Iniciar Sesión"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
