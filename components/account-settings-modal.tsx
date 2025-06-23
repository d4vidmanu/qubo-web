"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
}: AccountSettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [formData, setFormData] = useState({
    email: "profesor@ejemplo.com",
    nombre: "Juan",
    apellido: "Pérez",
    dni: "12345678",
    celular: "+1234567890",
  });

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving account settings:", formData);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
      onClose={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Configuración de la cuenta
      </h2>

      <div className="space-y-4">
        {[
          { label: "Email", field: "email", type: "email" },
          { label: "Nombre", field: "nombre", type: "text" },
          { label: "Apellido", field: "apellido", type: "text" },
          { label: "DNI", field: "dni", type: "text" },
          { label: "Número de celular", field: "celular", type: "tel" },
        ].map(({ label, field, type }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type={type}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        ))}

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </dialog>
  );
}
