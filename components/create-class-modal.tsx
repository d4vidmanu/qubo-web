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
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (className.trim()) {
      onCreateClass(className.trim());
      setClassName("");
      onClose();
    }
  };

  const handleClose = () => {
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
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!className.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      </div>
    </dialog>
  );
}
