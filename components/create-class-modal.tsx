"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClass: (className: string) => void;
}

export function CreateClassModal({
  isOpen,
  onClose,
  onCreateClass,
}: CreateClassModalProps) {
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  const handleCreate = async () => {
    setError("");
    const name = className.trim();
    if (!name) return;

    // Obtener token de cookie
    const match = document.cookie.match(/(^|;) *token=([^;]+)/);
    const token = match?.[2];
    if (!token) {
      setError("No se encontró token de autenticación.");
      return;
    }

    setLoading(true);
    try {
      // 1) Crear la clase
      const stage = process.env.NEXT_PUBLIC_USER_API_STAGE;
      const classroomUrl = `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${stage}/classrooms/create`;
      const resClass = await fetch(classroomUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name }),
      });
      const dataClass = await resClass.json();
      if (!resClass.ok) {
        throw new Error(dataClass.error || "Error creando la clase.");
      }
      const classroom_id = dataClass.classroom_id as string;

      // 2) Crear una asignación por defecto
      const assignmentUrl = `${process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL}/${stage}/assignments`;
      const payload = {
        classroom_id,
        game_name: classroom_id,
        level_ids: [],
      };

      await fetch(assignmentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error creando asignación.");
      });

      // 3) Notificar al padre y cerrar modal
      onCreateClass(name);
      setClassName("");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setClassName("");
    onClose();
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

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Nueva clase</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la clase
          </label>
          <input
            type="text"
            placeholder="Ingresa el nombre de la clase"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!className.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
