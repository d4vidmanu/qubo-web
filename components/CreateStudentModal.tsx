// components/CreateStudentModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  onSuccess: (student: any) => void;
}

export function CreateStudentModal({
  isOpen,
  onClose,
  classroomId,
  onSuccess,
}: CreateStudentModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show / hide the modal
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      // reset fields
      setName("");
      setLastName("");
      setDni("");
      setEmail("");
      setError("");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim() || !lastName.trim() || !dni.trim() || !email.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
      if (!token) throw new Error("No hay token de autenticación.");

      const stage = process.env.NEXT_PUBLIC_USER_API_STAGE;
      const base = process.env.NEXT_PUBLIC_USER_API_URL;

      const res = await fetch(
        `${base}/${stage}/auth/create-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            name: name.trim(),
            lastName: lastName.trim(),
            dni: dni.trim(),
            email: email.trim(),
            classroom_id: classroomId,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando alumno.");

      onSuccess(data);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
      onClose={handleClose}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Añadir Alumno
      </h2>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
        </div>
        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
        </div>
        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI
          </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Alumno"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
